const express = require('express');
const router = express.Router();
const prisma = require('../config/prisma');

/* ── Subject-name → cluster group mapping ─────────────────────── */
const GROUP_MAP = {
  'Engineering Mathematics I':              'Mathematics',
  'Engineering Mathematics II':             'Mathematics',
  'Engineering Physics':                    'Physics',
  'Engineering Chemistry':                  'Chemistry',
  'Fundamentals of Electrical Engineering': 'Electrical',
  'Electronics Engineering':                'Electronics',
  'Programming for Problem Solving':        'Programming',
  'Fundamentals of Mechanical Engineering': 'Mechanical',
  'Environment and Ecology':                'Environment',
  'Soft Skills':                            'Soft Skills',
};

/**
 * GET /api/concepts
 * Returns the full knowledge graph { nodes, links } for the 3-D explorer.
 *
 * nodes — one per topic, with group (subject cluster) info.
 * links — pre-computed ConceptRelation rows + live tag-match edges.
 */
router.get('/', async (req, res) => {
  try {
    const [topics, relations] = await prisma.$transaction([
      prisma.topic.findMany({
        include: {
          unit: { include: { subject: true } },
          conceptTags: true,
        },
      }),
      prisma.conceptRelation.findMany(),
    ]);

    /* ── Nodes ──────────────────────────────────────────────────── */
    const nodes = topics.map((t) => ({
      id:          t.id,
      name:        t.name,
      group:       GROUP_MAP[t.unit.subject.name] || t.unit.subject.name,
      subject:     t.unit.subject.name,
      subjectCode: t.unit.subject.code,
      unit:        t.unit.name,
      difficulty:  t.difficulty,
      importance:  t.importance,
      tags:        t.conceptTags.map((tag) => tag.name),
    }));

    /* ── Links from ConceptRelation table ───────────────────────── */
    const seenEdges = new Set();
    const links = [];

    for (const r of relations) {
      const key = [r.sourceTopicId, r.targetTopicId].sort().join('::');
      if (seenEdges.has(key)) continue;
      seenEdges.add(key);
      links.push({
        source:   r.sourceTopicId,
        target:   r.targetTopicId,
        strength: r.relationshipStrength,
        shared:   r.sharedTagsCount,
        type:     r.relationshipType,
      });
    }

    /* ── Live tag-match edges (catch any new topics not yet in the
         ConceptRelation table — keeps the graph always complete) ── */
    const tagToTopics = new Map();
    for (const t of topics) {
      for (const tag of t.conceptTags) {
        const key = tag.name.toLowerCase().trim();
        if (!tagToTopics.has(key)) tagToTopics.set(key, []);
        tagToTopics.get(key).push(t.id);
      }
    }

    const topicTagCount = new Map();
    for (const t of topics) topicTagCount.set(t.id, t.conceptTags.length);

    for (const topicIds of tagToTopics.values()) {
      for (let i = 0; i < topicIds.length; i++) {
        for (let j = i + 1; j < topicIds.length; j++) {
          const [a, b] = [topicIds[i], topicIds[j]].sort();
          const key = `${a}::${b}`;
          if (!seenEdges.has(key)) {
            seenEdges.add(key);
            const totalTags = (topicTagCount.get(a) || 1) + (topicTagCount.get(b) || 1);
            links.push({
              source:   a,
              target:   b,
              strength: parseFloat(((1 * 2) / totalTags).toFixed(4)),
              shared:   1,
              type:     'tag-match-live',
            });
          }
        }
      }
    }

    res.json({
      success: true,
      data: {
        nodes,
        links,
        stats: {
          totalNodes:     nodes.length,
          totalLinks:     links.length,
          storedEdges:    relations.length,
          liveEdges:      links.length - relations.length,
        },
      },
    });
  } catch (err) {
    console.error('Concept graph error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
