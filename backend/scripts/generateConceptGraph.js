/**
 * generateConceptGraph.js
 * ---------------------
 * Builds pairwise concept-relationships between Topics and stores
 * them in the ConceptRelation table.
 *
 * Relationship sources (strongest → weakest):
 *   1. exact-tag    — two topics share at least one identical concept tag
 *   2. word-overlap — tags share significant keywords (≥2 common words)
 *   3. same-unit    — topics belong to the same unit (sequential siblings)
 *
 * Run after the syllabus import:
 *   node scripts/generateConceptGraph.js
 */

const prisma = require('../config/prisma');

/* ── helpers ──────────────────────────────────────────────────── */
const STOP_WORDS = new Set([
  'a','an','and','are','as','at','be','by','for','from','has','he',
  'in','is','it','its','of','on','or','that','the','to','was','were',
  'will','with','this','not','but','they','have','had','been','no',
]);

/** Tokenise a tag string into meaningful words (lowercased, stop-words removed). */
function tokenise(tagName) {
  return tagName
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOP_WORDS.has(w));
}

async function generateGraph() {
  console.log('🔗 Generating concept graph …\n');

  /* ─── 1. Fetch topics with tags + structural info ────────────── */
  const topics = await prisma.topic.findMany({
    include: {
      conceptTags: true,
      unit: { select: { id: true, subjectId: true } },
    },
  });

  console.log(`   Loaded ${topics.length} topics.`);

  /* ─── 2. Build lookup maps ───────────────────────────────────── */
  const topicTagNames = new Map();   // topicId → Set<tagString>
  const topicWords    = new Map();   // topicId → Set<word>

  for (const t of topics) {
    const tagSet  = new Set(t.conceptTags.map((c) => c.name.toLowerCase().trim()));
    const wordSet = new Set();
    for (const c of t.conceptTags) {
      for (const w of tokenise(c.name)) wordSet.add(w);
    }
    // Also tokenise the topic name itself for extra connectivity
    for (const w of tokenise(t.name)) wordSet.add(w);

    topicTagNames.set(t.id, tagSet);
    topicWords.set(t.id, wordSet);
  }

  /* ─── 3. Compute pairwise relationships ──────────────────────── */
  //  pairKey → { source, target, sharedTags, sharedWords, sameUnit, type }
  const pairs = new Map();

  function getPair(a, b) {
    const [s, t] = [a, b].sort();
    const key = `${s}::${t}`;
    if (!pairs.has(key)) {
      pairs.set(key, { source: s, target: t, sharedTags: 0, sharedWords: 0, sameUnit: false });
    }
    return pairs.get(key);
  }

  for (let i = 0; i < topics.length; i++) {
    for (let j = i + 1; j < topics.length; j++) {
      const a = topics[i];
      const b = topics[j];

      /* exact tag match count */
      const tagsA = topicTagNames.get(a.id);
      const tagsB = topicTagNames.get(b.id);
      let sharedTags = 0;
      for (const tag of tagsA) {
        if (tagsB.has(tag)) sharedTags++;
      }

      /* word-level overlap count */
      const wordsA = topicWords.get(a.id);
      const wordsB = topicWords.get(b.id);
      let sharedWords = 0;
      for (const w of wordsA) {
        if (wordsB.has(w)) sharedWords++;
      }

      /* same unit? */
      const sameUnit = a.unitId === b.unitId;

      /* Decide whether to create an edge */
      const shouldLink =
        sharedTags >= 1 ||
        sharedWords >= 1 ||
        sameUnit;

      if (shouldLink) {
        const p = getPair(a.id, b.id);
        p.sharedTags  = sharedTags;
        p.sharedWords = sharedWords;
        p.sameUnit    = sameUnit;
      }
    }
  }

  console.log(`   Found ${pairs.size} topic pairs to store.\n`);

  /* ─── 4. Clear old generated relations & bulk insert ─────────── */
  await prisma.conceptRelation.deleteMany({});

  const records = [];
  for (const p of pairs.values()) {
    const totalTagsA = (topicTagNames.get(p.source)?.size || 1);
    const totalTagsB = (topicTagNames.get(p.target)?.size || 1);

    let strength;
    let type;

    if (p.sharedTags >= 1) {
      // Dice coefficient on exact tags
      strength = parseFloat(((p.sharedTags * 2) / (totalTagsA + totalTagsB)).toFixed(4));
      type = 'tag-match';
    } else if (p.sharedWords >= 1) {
      const totalWordsA = (topicWords.get(p.source)?.size || 1);
      const totalWordsB = (topicWords.get(p.target)?.size || 1);
      strength = parseFloat(((p.sharedWords * 2) / (totalWordsA + totalWordsB) * 0.6).toFixed(4));
      type = 'word-overlap';
    } else {
      strength = 0.15; // same-unit baseline
      type = 'same-unit';
    }

    records.push({
      sourceTopicId:        p.source,
      targetTopicId:        p.target,
      sharedTagsCount:      p.sharedTags,
      relationshipStrength: strength,
      relationshipType:     type,
    });
  }

  /* Prisma createMany for speed */
  const result = await prisma.conceptRelation.createMany({ data: records });
  console.log(`✔  Graph generated — ${result.count} relations inserted.`);

  /* ─── 5. Stats breakdown ────────────────────────────────────── */
  const byType = {};
  for (const r of records) byType[r.relationshipType] = (byType[r.relationshipType] || 0) + 1;
  console.log('   Breakdown:');
  for (const [t, c] of Object.entries(byType)) console.log(`     ${t}: ${c}`);
  console.log();

  await prisma.$disconnect();
}

generateGraph().catch((err) => {
  console.error('Graph generation failed:', err);
  process.exit(1);
});
