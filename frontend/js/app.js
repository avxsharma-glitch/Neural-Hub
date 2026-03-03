/**
 * NEURAL HUB // AVX — App Controller
 * Guided Engineering Mastery System
 * Learning Loop: Home → Study Path → Lesson → Practice → Analytics
 */

// ── Lesson State ─────────────────────────────────────────────────────────
const LessonState = {
    currentStep: 1,
    totalSteps: 5,
    currentTopic: null,
    currentSubject: null,
    quizAnswered: 0,
    quizTotal: 0,

    reset() {
        this.currentStep = 1;
        this.quizAnswered = 0;
        this.quizTotal = 0;
    }
};

// ── Study Path State ────────────────────────────────────────────────────
const PathState = {
    subjects: [],
    currentSubjectId: null,
    currentTopics: [],
    currentTopicId: null
};

class App {
    static async initialize() {
        this.setupNavigation();
        const user = JSON.parse(localStorage.getItem('nh_user') || '{}');
        const nameEl = document.getElementById('header-user-name');
        if (nameEl) nameEl.textContent = user.name || 'Student';

        await this.loadSubjects();
        this.loadHome();
        this.setupStudyPath();
        this.setupPractice();
        this.setupLesson();
        this.loadAnalytics();
    }

    // ── Navigation ─────────────────────────────────────────────────────
    static setupNavigation() {
        document.querySelectorAll('.nav-btn[data-target]').forEach(btn => {
            btn.addEventListener('click', e => {
                const target = e.currentTarget.getAttribute('data-target');
                UI.switchModule(target);
            });
        });
    }

    // ── Subject Loading ─────────────────────────────────────────────────
    static async loadSubjects() {
        try {
            PathState.subjects = await ApiService.getSubjects();
            // Populate subject dropdowns
            const opts = PathState.subjects.map(s =>
                `<option value="${s.id}">${s.code}: ${s.name}</option>`
            ).join('');

            ['sp-subject-select', 'pyq-subject-select'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.innerHTML = '<option value="">Select subject</option>' + opts;
            });

            // Build home subject tabs
            this._buildHomeTabs();
        } catch (e) {
            console.error('Subject load failed:', e);
        }
    }

    // ── HOME ────────────────────────────────────────────────────────────
    static async loadHome() {
        try {
            // Hero: highest priority topic (resume learning)
            const resumeTopic = await ApiService.getResumeLearning();
            this._renderHero(resumeTopic);

            // Roadmap for first subject by default
            if (PathState.subjects.length > 0) {
                await this._loadRoadmap(PathState.subjects[0].id);
            }

            // Priority list: weak topics ordered by importance
            await this._loadPriorityList();

            // Weekly summary
            await this._loadWeeklySummary();

        } catch (e) {
            console.error('Home load error:', e);
        }
    }

    static _renderHero(topic) {
        const nameEl = document.getElementById('hero-topic-name');
        const subEl = document.getElementById('hero-subject');
        const timeEl = document.getElementById('hero-time');
        const diffEl = document.getElementById('hero-difficulty');
        const startBtn = document.getElementById('hero-start-btn');

        if (!topic) {
            if (nameEl) nameEl.textContent = 'No topic to resume — start your first lesson below';
            return;
        }

        if (nameEl) nameEl.textContent = topic.name;
        if (subEl) subEl.textContent = topic.subject_name || '';

        const diffScore = parseFloat(topic.difficulty_score) || 0;
        const diffLabel = diffScore >= 4 ? 'High difficulty' : diffScore >= 3 ? 'Moderate' : 'Foundational';
        const diffClass = diffScore >= 4 ? 'high' : diffScore >= 3 ? 'medium' : '';
        if (diffEl) { diffEl.textContent = diffLabel; diffEl.className = `meta-pill difficulty-pill ${diffClass}`; }

        // Estimate time: difficulty × 7 min, capped 15–45
        const estTime = Math.min(Math.max(Math.round(diffScore * 7), 15), 45);
        if (timeEl) timeEl.textContent = `${estTime} min`;

        if (startBtn) {
            startBtn.disabled = false;
            startBtn.onclick = () => {
                LessonState.currentTopic = topic;
                LessonState.currentSubject = topic.subject_name || '';
                App._startLesson(topic);
                UI.switchModule('lesson');
            };
        }
    }

    static _buildHomeTabs() {
        const container = document.getElementById('home-subject-tabs');
        if (!container || PathState.subjects.length === 0) return;

        // Show first 5 subjects as tabs
        const shown = PathState.subjects.slice(0, 5);
        container.innerHTML = shown.map((s, i) =>
            `<button class="subject-tab ${i === 0 ? 'active' : ''}" data-id="${s.id}">${s.code}</button>`
        ).join('');

        container.querySelectorAll('.subject-tab').forEach(tab => {
            tab.addEventListener('click', async e => {
                container.querySelectorAll('.subject-tab').forEach(t => t.classList.remove('active'));
                e.target.classList.add('active');
                await App._loadRoadmap(e.target.getAttribute('data-id'));
            });
        });
    }

    static async _loadRoadmap(subjectId) {
        const list = document.getElementById('roadmap-list');
        if (!list) return;

        try {
            const topics = await ApiService.getTopics(subjectId);
            PathState.currentTopics = topics;

            if (topics.length === 0) {
                list.innerHTML = '<p class="placeholder-text">No topics found for this subject.</p>';
                return;
            }

            list.innerHTML = topics.map((t, i) => {
                const mastery = parseFloat(t.mastery_score) || 0;
                const done = mastery >= 0.7;
                const isCurrent = !done && i === topics.findIndex(x => parseFloat(x.mastery_score) < 0.7);
                const estMin = Math.min(Math.max(Math.round((parseFloat(t.difficulty_score) || 2) * 7), 15), 45);
                return `
                <div class="roadmap-item ${done ? 'completed' : ''} ${isCurrent ? 'active-item' : ''}"
                     data-id="${t.id}" data-subject-id="${subjectId}">
                    <div class="roadmap-status ${done ? 'done' : isCurrent ? 'current' : ''}">
                        ${done ? '✓' : isCurrent ? '→' : i + 1}
                    </div>
                    <span class="roadmap-item-name" title="${t.name}">${t.name}</span>
                    <div class="roadmap-item-right">
                        <span class="roadmap-time">${estMin}m</span>
                    </div>
                </div>`;
            }).join('');

            // Click to start lesson
            list.querySelectorAll('.roadmap-item').forEach(item => {
                item.addEventListener('click', async () => {
                    const topicId = item.getAttribute('data-id');
                    const topic = topics.find(t => t.id == topicId);
                    if (topic) {
                        LessonState.currentTopic = topic;
                        App._startLesson(topic);
                        UI.switchModule('lesson');
                    }
                });
            });
        } catch (e) {
            list.innerHTML = '<p class="placeholder-text">Failed to load roadmap.</p>';
        }
    }

    static async _loadPriorityList() {
        const list = document.getElementById('priority-list');
        if (!list) return;

        try {
            // Get all topics and sort by (importance × (1-mastery))
            let allTopics = [];
            for (const s of PathState.subjects.slice(0, 4)) {
                const topics = await ApiService.getTopics(s.id);
                topics.forEach(t => allTopics.push({ ...t, subject_code: s.code, subject_name: s.name }));
            }

            const priority = allTopics
                .filter(t => parseFloat(t.importance_weight) >= 4 && parseFloat(t.mastery_score) < 0.6)
                .sort((a, b) => {
                    const pa = parseFloat(a.importance_weight) * (1 - parseFloat(a.mastery_score));
                    const pb = parseFloat(b.importance_weight) * (1 - parseFloat(b.mastery_score));
                    return pb - pa;
                })
                .slice(0, 6);

            if (priority.length === 0) {
                list.innerHTML = '<p class="placeholder-text">No urgent topics — great work! 🎉</p>';
                return;
            }

            list.innerHTML = priority.map(t => `
                <div class="priority-item">
                    <div>
                        <div class="priority-item-name">${t.name}</div>
                        <div class="priority-item-sub">${t.subject_code}</div>
                    </div>
                    <span class="priority-badge">Review</span>
                </div>
            `).join('');

        } catch (e) {
            console.error('Priority list error:', e);
        }
    }

    static async _loadWeeklySummary() {
        try {
            const hist = await ApiService.getStabilityHistory();
            const el_s = document.getElementById('home-sessions');
            const el_a = document.getElementById('home-accuracy');
            const el_t = document.getElementById('home-topics-done');

            if (el_s) el_s.textContent = hist.length || 0;
            if (el_a) el_a.textContent = hist.length
                ? (hist.reduce((s, h) => s + Math.abs(parseFloat(h.delta) || 0), 0) / hist.length).toFixed(1)
                : '—';
            // Count topics with mastery > 0.7 across all loaded subjects
            let done = 0;
            for (const s of PathState.subjects.slice(0, 4)) {
                try {
                    const topics = await ApiService.getTopics(s.id);
                    done += topics.filter(t => parseFloat(t.mastery_score) >= 0.7).length;
                } catch (_) { }
            }
            if (el_t) el_t.textContent = done;

        } catch (e) {
            console.error('Weekly summary error:', e);
        }
    }

    // ── STUDY PATH ──────────────────────────────────────────────────────
    static setupStudyPath() {
        const select = document.getElementById('sp-subject-select');
        if (!select) return;

        select.addEventListener('change', async e => {
            const id = e.target.value;
            if (!id) return;
            PathState.currentSubjectId = id;
            await App._loadUnitTree(id);
        });
    }

    static async _loadUnitTree(subjectId) {
        const treeEl = document.getElementById('unit-tree');
        if (!treeEl) return;

        treeEl.innerHTML = '<p class="placeholder-text">Loading…</p>';

        try {
            const topics = await ApiService.getTopics(subjectId);
            PathState.currentTopics = topics;

            if (topics.length === 0) {
                treeEl.innerHTML = '<p class="placeholder-text">No topics found.</p>';
                return;
            }

            // Group by unit number from name (if available) or just list all
            treeEl.innerHTML = '';

            const unit = document.createElement('div');
            unit.className = 'unit-group';
            unit.innerHTML = `
                <div class="unit-group-header open">
                    <span class="unit-toggle">▶</span>
                    <span>All Topics</span>
                    <span style="margin-left:auto;font-family:var(--font-mono);font-size:11px;color:var(--text-tertiary);">${topics.length}</span>
                </div>
                <div class="unit-topics">
                    ${topics.map(t => {
                const mastery = parseFloat(t.mastery_score) || 0;
                const isDone = mastery >= 0.7;
                const isWeak = t.weak_flag;
                return `
                        <button class="unit-topic-btn ${isDone ? 'mastered' : ''}" data-id="${t.id}">
                            <div class="topic-status-dot ${isDone ? 'done' : isWeak ? 'weak' : ''}"></div>
                            ${t.name}
                        </button>`;
            }).join('')}
                </div>`;
            treeEl.appendChild(unit);

            // Toggle
            unit.querySelector('.unit-group-header').addEventListener('click', e => {
                const header = e.currentTarget;
                header.classList.toggle('open');
                unit.querySelector('.unit-topics').style.display =
                    header.classList.contains('open') ? '' : 'none';
            });

            // Topic click
            unit.querySelectorAll('.unit-topic-btn').forEach(btn => {
                btn.addEventListener('click', e => {
                    unit.querySelectorAll('.unit-topic-btn').forEach(b => b.classList.remove('active'));
                    e.currentTarget.classList.add('active');
                    const topicId = e.currentTarget.getAttribute('data-id');
                    const topic = topics.find(t => t.id == topicId);
                    if (topic) App._renderTopicCard(topic, subjectId);
                });
            });

        } catch (e) {
            treeEl.innerHTML = '<p class="placeholder-text">Failed to load topics.</p>';
        }
    }

    static async _renderTopicCard(topic, subjectId) {
        document.getElementById('sp-placeholder')?.classList.add('hidden');
        const card = document.getElementById('sp-topic-card');
        if (!card) return;
        card.classList.remove('hidden');

        const subj = PathState.subjects.find(s => s.id == subjectId);

        document.getElementById('sp-topic-unit').textContent = subj ? subj.code : '';
        document.getElementById('sp-topic-name').textContent = topic.name;

        // Stars for importance
        const imp = Math.round(parseFloat(topic.importance_weight) || 3);
        document.getElementById('sp-importance').textContent = '★'.repeat(imp) + '☆'.repeat(5 - imp);

        const diff = parseFloat(topic.difficulty_score) || 0;
        document.getElementById('sp-difficulty').textContent =
            diff >= 4 ? 'High' : diff >= 3 ? 'Medium' : 'Foundational';

        const estTime = Math.min(Math.max(Math.round(diff * 7), 15), 45);
        document.getElementById('sp-time').textContent = `${estTime} min`;

        const mastery = parseFloat(topic.mastery_score) || 0;
        document.getElementById('sp-mastery').textContent = `${(mastery * 100).toFixed(0)}%`;

        const fill = document.getElementById('sp-mastery-fill');
        if (fill) requestAnimationFrame(() => { fill.style.width = `${mastery * 100}%`; });

        // Tags
        const tags = document.getElementById('sp-concept-tags');
        if (tags) {
            const raw = topic.concept_tags || topic.name;
            const tagArr = Array.isArray(raw) ? raw : (raw || '').split(',').map(s => s.trim()).filter(Boolean).slice(0, 8);
            tags.innerHTML = tagArr.map(t => `<span class="concept-tag">${t}</span>`).join('');
        }

        // PYQ preview
        try {
            const pyqs = await ApiService.getPYQ(subjectId);
            const topicPYQs = pyqs.filter(q => q.topic_id === topic.id || q.topic_id == topic.id).slice(0, 3);
            const pyqList = document.getElementById('sp-pyq-list');
            const pyqSection = document.getElementById('sp-pyq-preview');
            if (pyqList) {
                if (topicPYQs.length === 0) {
                    if (pyqSection) pyqSection.style.display = 'none';
                } else {
                    if (pyqSection) pyqSection.style.display = '';
                    pyqList.innerHTML = topicPYQs.map(q => `
                        <div class="sp-pyq-item">
                            <div class="sp-pyq-year">Year: ${q.year} · Difficulty ${q.difficulty}/5</div>
                            ${q.question_text}
                        </div>`).join('');
                }
            }
        } catch (_) { }

        // Start lesson CTA
        const startBtn = document.getElementById('sp-start-btn');
        if (startBtn) {
            startBtn.onclick = () => {
                LessonState.currentTopic = topic;
                LessonState.currentSubject = subj?.name || '';
                App._startLesson(topic);
                UI.switchModule('lesson');
            };
        }
    }

    // ── LESSON ENGINE ───────────────────────────────────────────────────
    static setupLesson() {
        document.getElementById('lesson-back-btn')?.addEventListener('click', () => {
            UI.switchModule(PathState.currentSubjectId ? 'study-path' : 'home');
        });

        document.getElementById('lesson-prev-btn')?.addEventListener('click', () => {
            if (LessonState.currentStep > 1) App._goToStep(LessonState.currentStep - 1);
        });

        document.getElementById('lesson-next-btn')?.addEventListener('click', () => {
            if (LessonState.currentStep < LessonState.totalSteps) {
                App._goToStep(LessonState.currentStep + 1);
            }
        });
    }

    static async _startLesson(topic) {
        LessonState.reset();
        LessonState.currentTopic = topic;

        // Header
        const label = document.getElementById('lesson-topic-label');
        if (label) label.textContent = topic.name;

        // Fetch AI analysis
        let report = null;
        try {
            report = await ApiService.analyzeTopic(topic.id);
        } catch (_) { }

        // Step 1 — Concept
        const s1Title = document.getElementById('step1-title');
        const s1Content = document.getElementById('step1-content');
        if (s1Title) s1Title.textContent = topic.name;
        if (s1Content) {
            s1Content.innerHTML = report?.coreConcept
                ? `<p>${report.coreConcept}</p>`
                : `<p>This topic covers <strong>${topic.name}</strong>. Log in as admin and trigger AI generation to populate detailed explanations.</p>
                   <p style="margin-top:12px;color:var(--text-secondary);">Key focus areas: ${(topic.concept_tags || topic.name)}</p>`;
        }

        // Step 2 — Formulas
        const step2 = document.getElementById('step2-formulas');
        if (step2) {
            const rawFormulas = report?.keyFormulas;
            if (rawFormulas) {
                const lines = rawFormulas.split('\n').filter(Boolean);
                step2.innerHTML = lines.map(l => `
                    <div class="formula-card">
                        <div class="formula-expr">${l}</div>
                    </div>`).join('');
            } else {
                step2.innerHTML = `<div class="formula-card"><div class="formula-name">Core Formula</div><div class="formula-expr">No formulas cached. Trigger admin AI generation.</div></div>`;
            }
        }

        // Step 3 — Diagram
        const s3desc = document.getElementById('step3-desc');
        const s3tags = document.getElementById('step3-tags');
        if (s3desc) s3desc.textContent = `Conceptual diagram for: ${topic.name}`;
        if (s3tags) {
            const tagArr = (topic.concept_tags || '').split(',').map(s => s.trim()).filter(Boolean).slice(0, 5);
            s3tags.innerHTML = tagArr.map(t => `<span class="concept-tag">${t}</span>`).join('');
        }

        // Step 4 — Worked Example
        const exQ = document.getElementById('ex-question');
        const exS = document.getElementById('ex-solution');
        if (exQ) exQ.innerHTML = `<strong>Typical Exam-Style Question:</strong><br><br>Explain the concept of <em>${topic.name}</em> with a relevant example. [${Math.round((parseFloat(topic.importance_weight) || 3) * 2)} Marks]`;
        if (exS) exS.innerHTML = report?.commonPitfalls
            ? `💡 Strategy: Avoid these traps:<br>${report.commonPitfalls}`
            : 'Study the concept, then apply the key formula to a numerical problem. Structure your answer: define → formula → calculation → conclusion.';

        // Step 5 — Mini Quiz
        App._buildQuiz(topic, report);

        // Navigation
        App._goToStep(1);
        App._buildDots();
    }

    static _buildQuiz(topic, report) {
        const container = document.getElementById('quiz-container');
        if (!container) return;

        // 3 deterministic MCQs from concept tags
        const tags = (topic.concept_tags || topic.name).split(',').map(s => s.trim()).filter(Boolean);
        const questions = [
            {
                q: `Which of the following best describes "${tags[0] || topic.name}"?`,
                options: ['A foundational concept in this unit', 'An advanced derivation only', 'Not relevant to exams', 'Only applicable in practicals'],
                correct: 0
            },
            {
                q: `In problems involving "${topic.name}", which approach is most common in AKTU exams?`,
                options: ['Formula substitution with unit analysis', 'Graphical integration only', 'Trial and error', 'Memory-based answer'],
                correct: 0
            },
            {
                q: `The importance_weight of "${topic.name}" is ${parseFloat(topic.importance_weight) || 3}/5. This means:`,
                options: [
                    parseFloat(topic.importance_weight) >= 4 ? 'High exam priority — frequently tested' : 'Moderate exam priority',
                    'Can be skipped safely',
                    'Only in optional units',
                    'Not in syllabus'
                ],
                correct: 0
            }
        ];

        LessonState.quizTotal = questions.length;

        container.innerHTML = questions.map((q, qi) => `
            <div class="quiz-question">
                <div class="quiz-q-text">Q${qi + 1}: ${q.q}</div>
                <div class="quiz-options">
                    ${q.options.map((opt, oi) => `
                        <button class="quiz-option" data-qi="${qi}" data-oi="${oi}" data-correct="${q.correct}">
                            ${String.fromCharCode(65 + oi)}. ${opt}
                        </button>`).join('')}
                </div>
            </div>`).join('');

        container.querySelectorAll('.quiz-option').forEach(btn => {
            btn.addEventListener('click', e => {
                const qi = e.target.getAttribute('data-qi');
                const oi = parseInt(e.target.getAttribute('data-oi'));
                const correct = parseInt(e.target.getAttribute('data-correct'));

                // Disable all options for this question
                container.querySelectorAll(`.quiz-option[data-qi="${qi}"]`).forEach(b => {
                    b.disabled = true;
                    if (parseInt(b.getAttribute('data-oi')) === correct) b.classList.add('correct');
                });

                if (oi !== correct) e.target.classList.add('wrong');
                LessonState.quizAnswered++;

                // Show completion when all answered
                if (LessonState.quizAnswered >= LessonState.quizTotal) {
                    setTimeout(() => {
                        document.getElementById('lesson-completion')?.classList.remove('hidden');
                        document.getElementById('lesson-next-btn').disabled = true;
                    }, 500);
                }
            });
        });

        // Self-eval buttons
        document.querySelectorAll('.self-eval-btn').forEach(btn => {
            btn.addEventListener('click', async e => {
                const score = parseFloat(e.target.getAttribute('data-score'));
                await App._commitLessonCompletion(score);
            });
        });
    }

    static async _commitLessonCompletion(masteryScore) {
        try {
            await ApiService.request('/sessions', 'POST', {
                topic_id: LessonState.currentTopic?.id,
                duration: 30,
                accuracy: Math.round(masteryScore * 100),
                cognitive_intensity: Math.round(parseFloat(LessonState.currentTopic?.difficulty_score || 3) * 2)
            });
        } catch (_) { }
        UI.switchModule('home');
        App.loadHome();
    }

    static _goToStep(step) {
        LessonState.currentStep = step;
        const total = LessonState.totalSteps;

        document.querySelectorAll('.lesson-step').forEach((s, i) => {
            s.classList.remove('active');
            s.classList.add('hidden');
            if (i + 1 === step) {
                s.classList.remove('hidden');
                s.classList.add('active');
            }
        });

        const fill = document.getElementById('lesson-progress-fill');
        if (fill) fill.style.width = `${(step / total) * 100}%`;

        const counter = document.getElementById('lesson-step-counter');
        if (counter) counter.textContent = `Step ${step} of ${total}`;

        const prevBtn = document.getElementById('lesson-prev-btn');
        const nextBtn = document.getElementById('lesson-next-btn');
        if (prevBtn) prevBtn.disabled = step === 1;
        if (nextBtn) {
            nextBtn.disabled = (step === total);
            nextBtn.textContent = step < total - 1 ? 'Next →' : step === total - 1 ? 'Quiz →' : 'Finish ✓';
        }

        App._updateDots(step);
    }

    static _buildDots() {
        const container = document.getElementById('lesson-nav-dots');
        if (!container) return;
        container.innerHTML = Array.from({ length: LessonState.totalSteps }, (_, i) =>
            `<div class="lesson-dot" id="dot-${i + 1}"></div>`
        ).join('');
    }

    static _updateDots(step) {
        document.querySelectorAll('.lesson-dot').forEach((dot, i) => {
            dot.classList.remove('active', 'done');
            if (i + 1 === step) dot.classList.add('active');
            else if (i + 1 < step) dot.classList.add('done');
        });
    }

    // ── PRACTICE ────────────────────────────────────────────────────────
    static setupPractice() {
        const subSelect = document.getElementById('pyq-subject-select');
        const diffFilter = document.getElementById('pyq-difficulty-filter');
        const list = document.getElementById('pyq-list');
        const countEl = document.getElementById('pyq-count');
        let currentPYQs = [];

        const renderPYQs = () => {
            const fv = diffFilter.value;
            const filtered = fv === 'all' ? currentPYQs : currentPYQs.filter(q => q.difficulty >= parseInt(fv));
            if (countEl) countEl.textContent = filtered.length;

            if (filtered.length === 0) {
                list.innerHTML = '<div class="lab-placeholder"><div class="placeholder-icon">📭</div><p>No questions match filters.</p></div>';
                return;
            }

            list.innerHTML = filtered.map(q => `
                <div class="pyq-item" data-id="${q.id}">
                    <div class="pyq-header">
                        <div class="pyq-meta-left">
                            <span class="pyq-year">${q.year}</span>
                            <span class="diff-badge ${q.difficulty === 5 ? 'extreme' : ''}">Diff ${q.difficulty}/5</span>
                        </div>
                        <span class="pyq-marks">${q.marks ? q.marks + ' marks' : ''}</span>
                    </div>
                    <div class="pyq-body">${q.question_text}</div>
                    <div class="pyq-footer">
                        <button class="btn ghost-btn hint-btn" style="font-size:12px;padding:7px 14px;">💡 Hint</button>
                        <button class="btn ghost-btn solve-btn" style="font-size:12px;padding:7px 14px;">View Solution</button>
                    </div>
                    <div class="hint-section hidden">
                        <div class="hint-label">HINT</div>
                        Focus on the key formula for this topic. Break the problem into: given → formula → substitution → answer.
                    </div>
                    <div class="pyq-solution hidden"></div>
                    <div class="pyq-self-eval hidden">
                        <div class="pyq-eval-label">How did you find this?</div>
                        <div class="pyq-eval-buttons">
                            <button class="pyq-eval-btn easy" data-id="${q.id}" data-score="0.9">Easy</button>
                            <button class="pyq-eval-btn" data-id="${q.id}" data-score="0.6">Moderate</button>
                            <button class="pyq-eval-btn hard" data-id="${q.id}" data-score="0.3">Hard</button>
                        </div>
                    </div>
                </div>`).join('');

            // Hint buttons
            list.querySelectorAll('.hint-btn').forEach(btn => {
                btn.addEventListener('click', e => {
                    const item = e.target.closest('.pyq-item');
                    item.querySelector('.hint-section').classList.toggle('hidden');
                });
            });

            // Solve buttons
            list.querySelectorAll('.solve-btn').forEach(btn => {
                btn.addEventListener('click', async e => {
                    const item = e.target.closest('.pyq-item');
                    const qId = item.getAttribute('data-id');
                    const solDiv = item.querySelector('.pyq-solution');
                    const evalDiv = item.querySelector('.pyq-self-eval');
                    e.target.textContent = 'Loading…';
                    try {
                        const res = await ApiService.solveQuestion(qId);
                        solDiv.innerHTML = `
                            <div style="margin-bottom:8px;font-size:11px;color:${res.generated ? 'var(--positive)' : 'var(--warning)'};">
                                ${res.generated ? '✓ Cached solution' : '⚠ Admin generation required'}
                            </div>
                            <div class="mono-font" style="font-size:13px;">${res.solution?.steps ? res.solution.steps.join('<br>') : 'No steps available.'}</div>
                            <div style="margin-top:12px;"><strong>Answer:</strong> ${res.solution?.finalAnswer || 'N/A'}</div>`;
                        solDiv.classList.remove('hidden');
                        evalDiv.classList.remove('hidden');
                        e.target.classList.add('hidden');
                    } catch (_) { e.target.textContent = 'Failed'; }
                });
            });

            // Self-eval buttons
            list.querySelectorAll('.pyq-eval-btn').forEach(btn => {
                btn.addEventListener('click', async e => {
                    const score = parseFloat(e.target.getAttribute('data-score'));
                    const row = e.target.closest('.pyq-self-eval');
                    row.innerHTML = `<div style="font-size:12px;color:var(--positive);">✓ Logged — mastery updated</div>`;
                    try {
                        await ApiService.request('/sessions', 'POST', {
                            topic_id: null,
                            duration: 10,
                            accuracy: Math.round(score * 100),
                            cognitive_intensity: 5
                        });
                    } catch (_) { }
                });
            });
        };

        subSelect?.addEventListener('change', async e => {
            const id = e.target.value;
            if (!id) {
                currentPYQs = [];
                if (countEl) countEl.textContent = '—';
                list.innerHTML = '<div class="lab-placeholder"><div class="placeholder-icon">📖</div><p>Select a subject to load questions</p></div>';
                return;
            }
            list.innerHTML = '<div class="lab-placeholder"><div class="placeholder-icon">⬡</div><p>Loading…</p></div>';
            try {
                currentPYQs = await ApiService.getPYQ(id);
                renderPYQs();
            } catch (_) {
                list.innerHTML = '<div class="lab-placeholder"><div class="placeholder-icon">⚠</div><p>Failed to load.</p></div>';
            }
        });

        diffFilter?.addEventListener('change', renderPYQs);
    }

    // ── ANALYTICS ────────────────────────────────────────────────────────
    static async loadAnalytics() {
        try {
            const overview = await ApiService.getOverview();
            const niEl = document.getElementById('header-ni');
            const dtaEl = document.getElementById('dash-delta');
            if (niEl) niEl.textContent = overview.neural_index ? parseFloat(overview.neural_index).toFixed(2) : '—';
            if (dtaEl) dtaEl.textContent = overview.delta !== undefined
                ? (parseFloat(overview.delta) >= 0 ? '+' : '') + parseFloat(overview.delta).toFixed(2)
                : '—';

            const radarData = await ApiService.getRadarData();
            UI.drawRadarChart(radarData);

            const hist = await ApiService.getStabilityHistory();
            const histList = document.getElementById('stability-history');
            const sessEl = document.getElementById('analytics-sessions');
            const accEl = document.getElementById('analytics-accuracy');

            if (sessEl) sessEl.textContent = hist.length || 0;
            if (accEl) accEl.textContent = hist.length
                ? (hist.reduce((s, h) => s + Math.abs(parseFloat(h.delta) || 0), 0) / hist.length).toFixed(1)
                : '—';

            if (histList) {
                histList.innerHTML = hist.length === 0
                    ? '<p class="placeholder-text">No study sessions logged yet.</p>'
                    : hist.map(h => `
                        <div class="history-item ${parseFloat(h.delta) >= 0 ? 'positive' : 'negative'}">
                            <span>${new Date(h.date).toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short' })}</span>
                            <span class="delta-val">${parseFloat(h.delta) >= 0 ? '+' : ''}${h.delta}</span>
                        </div>`).join('');
            }

            const masteryData = await ApiService.getMasteryGrid();
            UI.drawMasteryGrid(masteryData);

        } catch (e) {
            console.error('Analytics load error:', e);
        }
    }
}

// ── ApiService extension for sessions POST ───────────────────────────────
// Extend ApiService inline for session logging
const _origRequest = ApiService.request.bind(ApiService);
ApiService.request = function (endpoint, method = 'GET', body = null) {
    return _origRequest(endpoint, method, body);
};

// Bootstrap
document.addEventListener('DOMContentLoaded', () => {
    AuthManager.init();
});
