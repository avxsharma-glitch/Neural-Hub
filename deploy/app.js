/**
 * NEURAL HUB // AVX — Guided Engineering Mastery System
 * Single-page app: vanilla JS, hash routing, REST + mock fallback
 */
(function () {
    'use strict';

    // ── Config ─────────────────────────────────────────────────────────────
    const CONFIG = {
        API_BASE: typeof window.API_BASE !== 'undefined' ? window.API_BASE : '/api',
        USE_MOCK: true
    };

    // ── Theme ─────────────────────────────────────────────────────────────
    const Theme = {
        get() { return localStorage.getItem('nh_theme') || 'dark'; },
        set(v) { localStorage.setItem('nh_theme', v); document.documentElement.setAttribute('data-theme', v === 'light' ? 'light' : ''); },
        init() {
            const t = this.get();
            if (t === 'light') document.documentElement.setAttribute('data-theme', 'light');
            else document.documentElement.removeAttribute('data-theme');
        },
        cycle() {
            const next = this.get() === 'dark' ? 'light' : 'dark';
            this.set(next);
            return next;
        }
    };

    // ── Toast ─────────────────────────────────────────────────────────────
    function toast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        if (!container) return;
        const el = document.createElement('div');
        el.className = 'toast' + (type === 'error' ? ' error' : type === 'success' ? ' success' : '');
        el.textContent = message;
        container.appendChild(el);
        setTimeout(() => el.remove(), 4000);
    }

    // ── Seed / Mock Data ──────────────────────────────────────────────────
    const SEED = {
        subjects: [
            { id: '1', code: 'KAS101', name: 'Physics', unitCount: 5 },
            { id: '2', code: 'KAS103', name: 'Mathematics I', unitCount: 5 },
            { id: '3', code: 'KCS101', name: 'Programming in C', unitCount: 5 }
        ],
        units: {
            '1': [
                { id: 'u1', title: 'Unit 1 — Mechanics', topicIds: ['t1', 't2'] },
                { id: 'u2', title: 'Unit 2 — Waves', topicIds: ['t3'] }
            ],
            '2': [
                { id: 'u1', title: 'Unit 1 — Calculus', topicIds: ['t4', 't5'] }
            ],
            '3': [
                { id: 'u1', title: 'Unit 1 — Basics', topicIds: ['t6', 't7'] }
            ]
        },
        topics: {
            '1': [
                { id: 't1', unitId: 'u1', name: 'Newton\'s Laws of Motion', importance_weight: 5, difficulty_score: 3.5, mastery_score: 0.2, concept_tags: 'Force, Acceleration, F=ma', est_min: 25 },
                { id: 't2', unitId: 'u1', name: 'Work and Energy', importance_weight: 4, difficulty_score: 3, mastery_score: 0.6, concept_tags: 'Work, Kinetic Energy, Potential', est_min: 20 },
                { id: 't3', unitId: 'u2', name: 'Simple Harmonic Motion', importance_weight: 5, difficulty_score: 4, mastery_score: 0, concept_tags: 'SHM, Oscillation, Frequency', est_min: 30 }
            ],
            '2': [
                { id: 't4', unitId: 'u1', name: 'Differentiation', importance_weight: 5, difficulty_score: 3, mastery_score: 0.8, concept_tags: 'Derivative, Limits, Rules', est_min: 25 },
                { id: 't5', unitId: 'u1', name: 'Integration', importance_weight: 5, difficulty_score: 4, mastery_score: 0.3, concept_tags: 'Antiderivative, Definite Integral', est_min: 30 }
            ],
            '3': [
                { id: 't6', unitId: 'u1', name: 'Variables and Data Types', importance_weight: 5, difficulty_score: 2, mastery_score: 0.9, concept_tags: 'int, float, char', est_min: 15 },
                { id: 't7', unitId: 'u1', name: 'Control Structures', importance_weight: 5, difficulty_score: 3, mastery_score: 0.5, concept_tags: 'if, for, while', est_min: 25 }
            ]
        },
        lesson: {
            explanation: 'Newton\'s three laws form the basis of classical mechanics. The first law states that a body remains at rest or in uniform motion unless acted upon by a force. The second law relates force to acceleration: F = ma. The third law states that for every action there is an equal and opposite reaction.',
            formulas: ['F = ma', 'W = F · d', 'KE = (1/2)mv²', 'PE = mgh'],
            diagramDesc: 'Free-body diagram: forces on an inclined plane.',
            workedExample: { question: 'A 5 kg block is pulled by a 20 N force. Find acceleration.', solution: 'Using F = ma: a = F/m = 20/5 = 4 m/s².' },
            practice: [{ prompt: 'A 10 kg mass has acceleration 2 m/s². Find the net force.', solution: 'F = 10 × 2 = 20 N' }],
            mcqs: [
                { q: 'What does Newton\'s second law relate?', options: ['Force and acceleration', 'Mass and velocity', 'Distance and time', 'Energy and work'], correct: 0 },
                { q: 'In F = ma, if force doubles and mass is constant, acceleration:', options: ['Doubles', 'Halves', 'Stays same', 'Quadruples'], correct: 0 },
                { q: 'Unit of force in SI is:', options: ['Newton (N)', 'Joule (J)', 'Watt (W)', 'Pascal (Pa)'], correct: 0 }
            ],
            audio_path: null
        },
        pyqs: [
            { id: 'pyq1', subjectId: '1', topicId: 't1', year: 2023, difficulty: 3, marks: 10, question_text: 'State Newton\'s laws of motion. Derive the relation F = ma.', hint: 'Start from change in momentum.', ai_solution: 'First law: ... Second law: F = dp/dt = m·a for constant m. Third law: action-reaction pairs.' },
            { id: 'pyq2', subjectId: '1', topicId: 't2', year: 2022, difficulty: 4, marks: 10, question_text: 'Define work and kinetic energy. Prove work-energy theorem.', hint: 'Use W = ∫F·ds and KE = (1/2)mv².', ai_solution: null },
            { id: 'pyq3', subjectId: '2', topicId: 't4', year: 2023, difficulty: 3, marks: 5, question_text: 'Differentiate x³ + 2x with respect to x.', hint: 'Use power rule.', ai_solution: 'd/dx(x³) + d/dx(2x) = 3x² + 2.' }
        ],
        analytics: {
            neural_index: 0.72,
            sessions_7d: 12,
            avg_accuracy: 78,
            weekly_delta: 0.05,
            radar: { labels: ['Mechanics', 'Waves', 'Calculus', 'Programming', 'Concepts', 'Problem Solving'], values: [0.6, 0.4, 0.7, 0.8, 0.65, 0.55] },
            histogram_7d: [2, 1, 3, 0, 2, 2, 2],
            stability: [
                { date: '2025-02-28', delta: 0.02 },
                { date: '2025-03-01', delta: -0.01 },
                { date: '2025-03-02', delta: 0.03 },
                { date: '2025-03-03', delta: 0.01 }
            ],
            mastery_grid: [
                { subject: 'Physics', code: 'KAS101', mastery: 0.45, topics_done: 2, total: 3 },
                { subject: 'Mathematics I', code: 'KAS103', mastery: 0.55, topics_done: 1, total: 2 },
                { subject: 'Programming in C', code: 'KCS101', mastery: 0.70, topics_done: 2, total: 2 }
            ]
        },
        resumeTopic: null
    };

    // Flatten topics for lookups
    function allTopics() {
        const out = [];
        Object.keys(SEED.topics).forEach(sid => {
            SEED.topics[sid].forEach(t => {
                const sub = SEED.subjects.find(s => s.id === sid);
                out.push({ ...t, subject_id: sid, subject_name: sub?.name, subject_code: sub?.code });
            });
        });
        return out;
    }
    function setResumeTopic(topic) { SEED.resumeTopic = topic; }

    // ── API Layer ────────────────────────────────────────────────────────
    async function api(endpoint, options = {}) {
        const token = localStorage.getItem('nh_token');
        const headers = { 'Content-Type': 'application/json', ...options.headers };
        if (token) headers['Authorization'] = `Bearer ${token}`;
        const url = CONFIG.API_BASE + endpoint;
        try {
            const res = await fetch(url, { ...options, headers });
            if (res.status === 401) {
                localStorage.removeItem('nh_token');
                localStorage.removeItem('nh_user');
                toast('Session expired. Please sign in again.', 'error');
                if (window.location.hash && window.location.hash !== '#/' && window.location.hash !== '#') {
                    window.location.hash = '#/';
                }
                return null;
            }
            if (!res.ok) throw new Error(res.statusText);
            const data = await res.json().catch(() => ({}));
            return data;
        } catch (e) {
            if (CONFIG.USE_MOCK) return null;
            throw e;
        }
    }

    const API = {
        async getSubjects() {
            const d = await api('/subjects');
            if (d && Array.isArray(d)) return d;
            return SEED.subjects;
        },
        async getSubjectUnits(subjectId) {
            const d = await api(`/subjects/${subjectId}/units`);
            if (d && Array.isArray(d)) return d;
            return SEED.units[subjectId] || [];
        },
        async getTopic(topicId) {
            const d = await api(`/topics/${topicId}`);
            if (d && d.id) return d;
            for (const sid of Object.keys(SEED.topics)) {
                const t = SEED.topics[sid].find(x => x.id === topicId);
                if (t) return { ...t, subject_id: sid, subject_name: SEED.subjects.find(s => s.id === sid)?.name };
            }
            return null;
        },
        async getLesson(topicId) {
            const d = await api(`/topics/${topicId}/lesson`);
            if (d && (d.explanation || d.formulas)) return d;
            return { ...SEED.lesson };
        },
        async postStudySession(body) {
            const d = await api('/study-sessions', { method: 'POST', body: JSON.stringify(body) });
            return d !== null;
        },
        async getPYQ(params = {}) {
            const q = new URLSearchParams(params).toString();
            const d = await api('/pyq?' + q);
            if (d && Array.isArray(d)) return d;
            let list = SEED.pyqs;
            if (params.subject) list = list.filter(p => p.subjectId === params.subject);
            if (params.year) list = list.filter(p => p.year === parseInt(params.year));
            if (params.difficulty) list = list.filter(p => p.difficulty >= parseInt(params.difficulty));
            return list;
        },
        async getAnalyticsOverview(subjectId) {
            const path = subjectId ? `/analytics/overview/${subjectId}` : '/analytics/overview';
            const d = await api(path);
            if (d) return d;
            return SEED.analytics;
        },
        async getResumeLearning() {
            const d = await api('/analytics/resume-learning');
            if (d && d.id) return d;
            return SEED.resumeTopic || allTopics().find(t => (parseFloat(t.mastery_score) || 0) < 0.7) || allTopics()[0];
        }
    };

    // ── Router ───────────────────────────────────────────────────────────
    function parseHash() {
        const hash = window.location.hash.slice(1) || '/';
        const path = hash.startsWith('/') ? hash : '/' + hash;
        const parts = path.split('/').filter(Boolean);
        return {
            path,
            parts,
            subjectId: parts[1] || null,
            topicId: parts[3] || null,
            isLesson: parts[4] === 'lesson'
        };
    }

    // ── Icons (inline SVG) ────────────────────────────────────────────────
    const Icons = {
        home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
        book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>',
        practice: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>',
        chart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>',
        settings: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
        logout: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>',
        play: '<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>',
        pause: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>',
        chevron: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>'
    };

    // ── Components ───────────────────────────────────────────────────────
    function renderLeftNav(activeRoute) {
        const isApp = activeRoute === 'app' || activeRoute === 'subject' || activeRoute === 'pyq' || activeRoute === 'analytics' || activeRoute === 'admin';
        const nav = [
            { id: 'app', href: '#/app', label: 'Home', icon: Icons.home },
            { id: 'subject', href: '#/subject/1', label: 'Study Path', icon: Icons.book },
            { id: 'pyq', href: '#/pyq', label: 'PYQ Archive', icon: Icons.practice },
            { id: 'analytics', href: '#/analytics', label: 'Analytics', icon: Icons.chart },
            { id: 'admin', href: '#/admin', label: 'Admin', icon: Icons.settings }
        ];
        const active = activeRoute === 'admin' ? 'admin' : (activeRoute === 'subject' || activeRoute === 'lesson') ? 'subject' : activeRoute === 'pyq' ? 'pyq' : activeRoute === 'analytics' ? 'analytics' : 'app';
        return `
            <aside class="left-nav" id="left-nav" aria-label="Main navigation">
                <div class="nav-logo">NH <span class="accent">//</span> AVX</div>
                <nav>
                    ${nav.map(n => `<a class="nav-item ${n.id === active ? 'active' : ''}" href="${n.href}" data-route="${n.id}">${n.icon} <span class="nav-label">${n.label}</span></a>`).join('')}
                </nav>
                <div class="nav-bottom">
                    <button type="button" class="nav-item btn-ghost" id="theme-toggle" title="Toggle theme">Theme</button>
                    <a class="nav-item" href="#/" id="nav-logout">${Icons.logout} <span class="nav-label">Sign Out</span></a>
                </div>
            </aside>`;
    }

    function renderTopBar(resumeLabel, neuralMetric) {
        return `
            <header class="top-bar" role="banner">
                <div class="top-bar-left">
                    <a href="#/app" class="btn btn-primary resume-cta">${resumeLabel || 'Resume'}</a>
                </div>
                <div class="top-bar-right">
                    <span class="neural-metric" id="neural-metric" data-tooltip="Neural Index: composite measure of consistency and mastery growth">${neuralMetric != null ? 'NI ' + neuralMetric : '—'}</span>
                </div>
            </header>`;
    }

    function renderProgressBar(value, max, label) {
        const pct = max ? Math.min(100, (value / max) * 100) : 0;
        return `<div class="progress-bar" role="progressbar" aria-valuenow="${value}" aria-valuemin="0" aria-valuemax="${max || 100}" aria-label="${label || 'Progress'}"><span class="sr-only">${value} of ${max || 100}</span><div class="progress-fill" style="width:${pct}%"></div></div>`;
    }

    function renderAudioPlayer(audioPath) {
        if (!audioPath) return '';
        return `
            <div class="audio-player" role="group" aria-label="Topic audio" data-audio-src="${audioPath}">
                <audio src="${audioPath}" preload="metadata"></audio>
                <button type="button" class="audio-play-pause" aria-label="Play">${Icons.play}</button>
                <div class="progress-wrap" role="slider" tabindex="0" aria-valuemin="0" aria-valuemax="100"><div class="progress-inner"></div></div>
                <span class="time">0:00 / 0:00</span>
            </div>`;
    }

    // ── Page: Landing ─────────────────────────────────────────────────────
    function renderLanding() {
        return `
            <div class="landing">
                <section class="landing-hero">
                    <h1>NEURAL HUB <span class="accent">//</span> AVX</h1>
                    <p>Guided Engineering Mastery. One path from syllabus to exam-ready.</p>
                    <div class="landing-cta">
                        <a href="#/app" class="btn btn-primary">Get Started</a>
                        <button type="button" class="btn btn-secondary" id="try-demo">Try Demo</button>
                    </div>
                </section>
                <section class="landing-features grid grid-12">
                    <div class="card"><h3>Guided Lessons</h3><p>Step-by-step explanations, formulas, and worked examples.</p></div>
                    <div class="card"><h3>Curated PYQs</h3><p>Past year questions with hints and AI solutions.</p></div>
                    <div class="card"><h3>Practice Mode</h3><p>Attempt, self-evaluate, and track mastery.</p></div>
                    <div class="card"><h3>Analytics</h3><p>Reflection, radar charts, and study histograms.</p></div>
                </section>
            </div>`;
    }

    // ── Page: App Home ───────────────────────────────────────────────────
    async function renderAppHome() {
        const subjects = await API.getSubjects();
        const resume = await API.getResumeLearning();
        const overview = await API.getAnalyticsOverview();
        const topicsBySubject = {};
        for (const s of subjects.slice(0, 4)) {
            const topics = SEED.topics[s.id] || [];
            topicsBySubject[s.id] = topics;
        }
        const priority = allTopics()
            .filter(t => (parseFloat(t.importance_weight) || 0) >= 4 && (parseFloat(t.mastery_score) || 0) < 0.6)
            .sort((a, b) => (parseFloat(b.importance_weight) || 0) * (1 - (parseFloat(b.mastery_score) || 0)) - (parseFloat(a.importance_weight) || 0) * (1 - (parseFloat(a.mastery_score) || 0)))
            .slice(0, 6);
        const firstSubjectId = subjects[0]?.id || '1';
        const roadmapTopics = topicsBySubject[firstSubjectId] || [];
        const neuralIndex = overview?.neural_index != null ? Number(overview.neural_index).toFixed(2) : '—';
        const shell = `
            <div class="app-shell">
                ${renderLeftNav('app')}
                <div class="app-main">
                    ${renderTopBar('Resume', neuralIndex)}
                    <div class="content-inner">
                        <div class="continue-hero" id="continue-hero">
                            <div class="hero-label">Continue Learning</div>
                            <div class="hero-body">
                                <div class="hero-info">
                                    <h2 class="hero-title" id="hero-topic-name">${resume ? resume.name : 'Start your first lesson'}</h2>
                                    <div class="hero-meta" id="hero-meta">
                                        ${resume ? `<span class="badge">${resume.subject_code || ''}</span><span class="badge">${resume.est_min || 20} min</span><span class="badge difficulty-stars">${'★'.repeat(Math.min(5, Math.round(parseFloat(resume.difficulty_score) || 3)))}</span>` : ''}
                                    </div>
                                </div>
                                <div class="hero-cta">
                                    <a href="#/subject/${(resume?.subject_id || resume?.subjectId) || firstSubjectId}/topic/${resume?.id || (roadmapTopics[0]?.id)}/lesson" class="btn btn-primary" id="hero-start-lesson">Start Lesson →</a>
                                </div>
                            </div>
                        </div>
                        <div class="grid grid-12" style="grid-template-columns: 1fr 1fr;">
                            <div class="panel" style="grid-column: span 1;">
                                <div class="panel-header"><h2 class="panel-title">Study Roadmap</h2></div>
                                <div class="subject-tabs" id="home-subject-tabs">${subjects.slice(0, 5).map((s, i) => `<button type="button" class="btn btn-ghost subject-tab ${i === 0 ? 'active' : ''}" data-id="${s.id}">${s.code}</button>`).join('')}</div>
                                <ul class="roadmap-list" id="roadmap-list">${(roadmapTopics.slice(0, 8).map((t, i) => {
            const done = (parseFloat(t.mastery_score) || 0) >= 0.7;
            return `<li class="roadmap-item ${done ? 'done' : ''}" data-subject-id="${firstSubjectId}" data-topic-id="${t.id}"><span class="roadmap-status">${done ? '✓' : i + 1}</span><span>${t.name}</span><span class="muted">${t.est_min || 20}m</span></li>`;
        })).join('')}</ul>
                            </div>
                            <div>
                                <div class="panel">
                                    <div class="panel-header"><h2 class="panel-title">High Priority</h2></div>
                                    <ul class="priority-list" id="priority-list">${priority.length ? priority.map(t => `<li class="priority-item"><div><strong>${t.name}</strong><br><span class="muted">${t.subject_code}</span></div><span class="badge accent">Review</span></li>`).join('') : '<li class="muted">No urgent topics — great work!</li>'}</ul>
                                </div>
                                <div class="panel" style="margin-top: var(--space-2);">
                                    <div class="panel-header"><h2 class="panel-title">Weekly Progress</h2></div>
                                    <div class="analytics-summary">
                                        <div class="card"><span class="muted">Sessions</span><strong id="home-sessions">${overview?.sessions_7d ?? 0}</strong></div>
                                        <div class="card"><span class="muted">Avg Accuracy</span><strong id="home-accuracy">${overview?.avg_accuracy ?? '—'}%</strong></div>
                                        <div class="card"><span class="muted">Topics Done</span><strong id="home-topics-done">${allTopics().filter(t => (parseFloat(t.mastery_score) || 0) >= 0.7).length}</strong></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;
        return shell;
    }

    // ── Page: Study Path ─────────────────────────────────────────────────
    async function renderStudyPath(subjectId) {
        subjectId = subjectId || (await API.getSubjects())[0]?.id || '1';
        const subjects = await API.getSubjects();
        const units = await API.getSubjectUnits(subjectId);
        const topics = SEED.topics[subjectId] || [];
        const sub = subjects.find(s => s.id === subjectId);
        const route = parseHash();
        const selectedTopicId = route.topicId;
        const selectedTopic = topics.find(t => t.id === selectedTopicId);
        let unitTreeHtml = '';
        if (Array.isArray(units) && units.length) {
            unitTreeHtml = units.map(u => {
                const children = (u.topicIds || []).map(tid => {
                    const t = topics.find(x => x.id === tid);
                    if (!t) return '';
                    const done = (parseFloat(t.mastery_score) || 0) >= 0.7;
                    const weak = (parseFloat(t.importance_weight) || 0) >= 4 && (parseFloat(t.mastery_score) || 0) < 0.6;
                    return `<button type="button" class="topic-item ${selectedTopicId === t.id ? 'active' : ''} ${done ? 'done' : ''} ${weak ? 'weak' : ''}" data-topic-id="${t.id}"><span class="topic-dot"></span>${t.name}</button>`;
                }).join('');
                return `
                    <div class="unit-group">
                        <button type="button" class="unit-header" aria-expanded="true">${Icons.chevron}<span>${u.title}</span></button>
                        <div class="unit-children">${children}</div>
                    </div>`;
            }).join('');
        } else {
            unitTreeHtml = '<div class="unit-group"><button type="button" class="unit-header" aria-expanded="true">' + Icons.chevron + '<span>All Topics</span></button><div class="unit-children">' + topics.map(t => {
                const done = (parseFloat(t.mastery_score) || 0) >= 0.7;
                return `<button type="button" class="topic-item ${selectedTopicId === t.id ? 'active' : ''} ${done ? 'done' : ''}" data-topic-id="${t.id}"><span class="topic-dot"></span>${t.name}</button>`;
            }).join('') + '</div></div>';
        }
        const topicCard = selectedTopic ? `
            <div class="topic-card panel">
                <h2 class="panel-title">${selectedTopic.name}</h2>
                <div class="meta-row">
                    <span>Importance: ${'★'.repeat(Math.round(parseFloat(selectedTopic.importance_weight) || 3))}</span>
                    <span>Difficulty: ${(parseFloat(selectedTopic.difficulty_score) || 0) >= 4 ? 'High' : (parseFloat(selectedTopic.difficulty_score) || 0) >= 3 ? 'Medium' : 'Foundational'}</span>
                    <span>Est. ${selectedTopic.est_min || 20} min</span>
                    <span>Mastery: ${((parseFloat(selectedTopic.mastery_score) || 0) * 100).toFixed(0)}%</span>
                </div>
                ${renderProgressBar((parseFloat(selectedTopic.mastery_score) || 0) * 100, 100, 'Mastery')}
                <p class="muted" style="margin-top: var(--space-2);">${(selectedTopic.concept_tags || '').split(',').map(s => s.trim()).filter(Boolean).join(' · ')}</p>
                <a href="#/subject/${subjectId}/topic/${selectedTopic.id}/lesson" class="btn btn-primary" style="margin-top: var(--space-2);">Start Lesson →</a>
            </div>` : '<div class="placeholder-state"><div class="icon">📚</div><p>Select a topic from the unit tree</p></div>';
        return `
            <div class="app-shell">
                ${renderLeftNav('subject')}
                <div class="app-main">
                    ${renderTopBar('Resume', null)}
                    <div class="content-inner">
                        <div class="study-path-layout">
                            <div class="study-path-sidebar">
                                <label>Subject</label>
                                <select id="sp-subject-select" class="field-select">${subjects.map(s => `<option value="${s.id}" ${s.id === subjectId ? 'selected' : ''}>${s.code}: ${s.name}</option>`).join('')}</select>
                                <div class="topic-tree" id="unit-tree" style="margin-top: var(--space-2);" role="tree">${unitTreeHtml}</div>
                            </div>
                            <div class="study-path-main">${topicCard}</div>
                        </div>
                    </div>
                </div>
            </div>`;
    }

    // ── Page: Lesson Mode ────────────────────────────────────────────────
    const TOTAL_STEPS = 6;
    let lessonState = { step: 1, topic: null, subjectId: null, lessonData: null, quizAnswered: 0, quizTotal: 3 };

    async function renderLessonMode(subjectId, topicId) {
        const topic = await API.getTopic(topicId);
        if (!topic) return `<div class="content-inner"><p>Topic not found.</p><a href="#/app" class="btn btn-primary">Back to Home</a></div>`;
        const lessonData = await API.getLesson(topicId);
        lessonState = { step: 1, topic, subjectId, lessonData: lessonData || SEED.lesson, quizAnswered: 0, quizTotal: (lessonData?.mcqs || SEED.lesson.mcqs).length };
        const mcqs = lessonData?.mcqs || SEED.lesson.mcqs;
        const steps = [
            { tag: '1 — Explanation', title: topic.name, content: (lessonData?.explanation || SEED.lesson.explanation) },
            { tag: '2 — Key Formulas', title: 'Core Formulas', content: null, formulas: lessonData?.formulas || SEED.lesson.formulas },
            { tag: '3 — Visual', title: 'Concept Diagram', content: lessonData?.diagramDesc || SEED.lesson.diagramDesc },
            { tag: '4 — Worked Example', title: 'Worked Example', example: lessonData?.workedExample || SEED.lesson.workedExample },
            { tag: '5 — Practice', title: 'Practice', practice: lessonData?.practice || SEED.lesson.practice },
            { tag: '6 — Mini Quiz', title: 'Quick Check', mcqs }
        ];
        const stepBlocks = steps.map((s, i) => {
            const stepNum = i + 1;
            let body = '';
            if (s.content) body = `<div class="step-content">${s.content.split(/\n/).filter(Boolean).map(p => `<p>${p}</p>`).join('')}</div>`;
            else if (s.formulas) body = `<div class="formula-grid">${s.formulas.map(f => `<div class="formula-card">${f}</div>`).join('')}</div>`;
            else if (s.tag.includes('Visual')) body = `<div class="diagram-area"><p>${s.content || 'Diagram placeholder'}</p></div>`;
            else if (s.example) body = `<div class="practice-block"><p><strong>Question:</strong> ${s.example.question}</p><p><strong>Solution:</strong> ${s.example.solution}</p></div>`;
            else if (s.practice && s.practice.length) body = `<div class="practice-block">${s.practice.map(p => `<p><strong>${p.prompt}</strong></p><p class="muted">Solution: ${p.solution}</p>`).join('')}</div>`;
            else if (s.mcqs && s.mcqs.length) {
                body = `<div class="quiz-mcqs" id="lesson-quiz">${s.mcqs.map((mq, qi) => `
                    <div class="quiz-q"><p>Q${qi + 1}: ${mq.q}</p>
                    <div class="quiz-options">${(mq.options || []).map((opt, oi) => `<button type="button" class="quiz-option" data-qi="${qi}" data-oi="${oi}" data-correct="${mq.correct}">${String.fromCharCode(65 + oi)}. ${opt}</button>`).join('')}</div></div>`).join('')}</div>
                    <div class="completion-block hidden" id="lesson-completion">
                        <h3>Lesson Complete!</h3>
                        <p class="muted">How confident are you?</p>
                        <div class="self-eval-row">
                            <button type="button" class="btn btn-ghost self-eval" data-score="0.4">Unsure</button>
                            <button type="button" class="btn btn-secondary self-eval" data-score="0.7">Got it</button>
                            <button type="button" class="btn btn-primary self-eval" data-score="1">Confident</button>
                        </div>
                        <button type="button" class="btn btn-primary" id="mark-complete">Mark Complete</button>
                    </div>`;
            }
            return `<div class="lesson-step ${stepNum === 1 ? 'active' : ''}" id="step-${stepNum}" data-step="${stepNum}"><div class="step-tag">${s.tag}</div><h2 class="step-title">${s.title}</h2>${body}</div>`;
        }).join('');
        const audioHtml = renderAudioPlayer(lessonData?.audio_path);
        return `
            <div class="lesson-mode" id="lesson-mode">
                <div class="lesson-header">
                    <a href="#/subject/${subjectId}" class="btn btn-ghost" id="lesson-back">← Back</a>
                    <div class="lesson-progress-wrap">
                        <div class="lesson-step-info">
                            <span id="lesson-topic-label">${topic.name}</span>
                            <span class="lesson-step-counter" id="lesson-step-counter">Step 1 of ${TOTAL_STEPS}</span>
                        </div>
                        <div class="lesson-progress-track"><div class="lesson-progress-fill" id="lesson-progress-fill" style="width:${(1/TOTAL_STEPS)*100}%"></div></div>
                    </div>
                </div>
                <div class="lesson-body">
                    ${audioHtml}
                    ${stepBlocks}
                </div>
                <div class="lesson-nav">
                    <button type="button" class="btn btn-ghost" id="lesson-prev" disabled>← Previous</button>
                    <div class="lesson-step-nav" id="lesson-dots"></div>
                    <button type="button" class="btn btn-primary" id="lesson-next">Next →</button>
                </div>
            </div>`;
    }

    function formatTime(s) { const m = Math.floor(s / 60); const sec = Math.floor(s % 60); return m + ':' + (sec < 10 ? '0' : '') + sec; }
    function bindLessonMode(container, subjectId, topicId) {
        if (!container) return;
        const steps = container.querySelectorAll('.lesson-step');
        const progressFill = container.querySelector('#lesson-progress-fill');
        const counter = container.querySelector('#lesson-step-counter');
        const prevBtn = container.querySelector('#lesson-prev');
        const nextBtn = container.querySelector('#lesson-next');
        const backBtn = container.querySelector('#lesson-back');
        const dotsContainer = container.querySelector('#lesson-dots');
        const quizContainer = container.querySelector('#lesson-quiz');
        const completionBlock = container.querySelector('#lesson-completion');
        const markCompleteBtn = container.querySelector('#mark-complete');
        const selfEvalBtns = container.querySelectorAll('.self-eval');

        function updateStep(step) {
            lessonState.step = step;
            steps.forEach((s, i) => {
                const n = i + 1;
                s.classList.toggle('active', n === step);
                s.classList.toggle('hidden', n !== step);
            });
            if (progressFill) progressFill.style.width = `${(step / TOTAL_STEPS) * 100}%`;
            if (counter) counter.textContent = `Step ${step} of ${TOTAL_STEPS}`;
            if (prevBtn) prevBtn.disabled = step === 1;
            if (nextBtn) {
                nextBtn.disabled = step === TOTAL_STEPS;
                nextBtn.textContent = step === TOTAL_STEPS ? 'Finish' : step === TOTAL_STEPS - 1 ? 'Quiz →' : 'Next →';
            }
            if (dotsContainer) {
                dotsContainer.innerHTML = Array.from({ length: TOTAL_STEPS }, (_, i) => {
                    const n = i + 1;
                    let c = 'lesson-step-dot';
                    if (n === step) c += ' active';
                    else if (n < step) c += ' done';
                    return `<button type="button" class="${c}" data-step="${n}" aria-label="Step ${n}"> </button>`;
                }).join('');
                dotsContainer.querySelectorAll('button').forEach(btn => {
                    btn.addEventListener('click', () => updateStep(parseInt(btn.dataset.step)));
                });
            }
        }

        prevBtn?.addEventListener('click', () => { if (lessonState.step > 1) updateStep(lessonState.step - 1); });
        nextBtn?.addEventListener('click', () => {
            if (lessonState.step < TOTAL_STEPS) updateStep(lessonState.step + 1);
        });
        backBtn?.addEventListener('click', e => { e.preventDefault(); window.location.hash = '#/subject/' + subjectId; });
        markCompleteBtn?.addEventListener('click', async () => {
            try {
                await API.postStudySession({
                    userId: localStorage.getItem('nh_user_id') || 'demo',
                    topicId: lessonState.topic?.id,
                    duration: 25,
                    accuracy: 85
                });
                toast('Session logged.', 'success');
            } catch (_) {}
            setResumeTopic(lessonState.topic);
            window.location.hash = '#/app';
        });
        selfEvalBtns?.forEach(btn => {
            btn.addEventListener('click', () => {
                markCompleteBtn?.click();
            });
        });

        if (quizContainer) {
            quizContainer.querySelectorAll('.quiz-option').forEach(btn => {
                btn.addEventListener('click', function () {
                    const qi = parseInt(this.dataset.qi);
                    const oi = parseInt(this.dataset.oi);
                    const correct = parseInt(this.dataset.correct);
                    quizContainer.querySelectorAll(`.quiz-option[data-qi="${qi}"]`).forEach(b => { b.disabled = true; if (parseInt(b.dataset.oi) === correct) b.classList.add('correct'); });
                    if (oi !== correct) this.classList.add('wrong');
                    lessonState.quizAnswered++;
                    if (lessonState.quizAnswered >= lessonState.quizTotal) {
                        completionBlock?.classList.remove('hidden');
                        nextBtn.disabled = true;
                    }
                });
            });
        }
        document.addEventListener('keydown', function lessonKeydown(e) {
            if (!container.closest('.lesson-mode') || !document.getElementById('lesson-mode')) {
                document.removeEventListener('keydown', lessonKeydown);
                return;
            }
            if (e.key === 'ArrowLeft' && lessonState.step > 1) { e.preventDefault(); updateStep(lessonState.step - 1); }
            if (e.key === 'ArrowRight' && lessonState.step < TOTAL_STEPS) { e.preventDefault(); updateStep(lessonState.step + 1); }
        });
        const audioWrap = container.querySelector('.audio-player');
        if (audioWrap) {
            const audio = audioWrap.querySelector('audio');
            const playBtn = audioWrap.querySelector('.audio-play-pause');
            const progressInner = audioWrap.querySelector('.progress-inner');
            const timeEl = audioWrap.querySelector('.time');
            if (audio && playBtn) {
                playBtn.addEventListener('click', () => {
                    if (audio.paused) { audio.play(); playBtn.innerHTML = Icons.pause; playBtn.setAttribute('aria-label', 'Pause'); }
                    else { audio.pause(); playBtn.innerHTML = Icons.play; playBtn.setAttribute('aria-label', 'Play'); }
                });
                audio.addEventListener('timeupdate', () => {
                    const pct = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
                    if (progressInner) progressInner.style.width = pct + '%';
                    if (timeEl) timeEl.textContent = formatTime(audio.currentTime) + ' / ' + formatTime(audio.duration || 0);
                });
                audio.addEventListener('ended', () => { playBtn.innerHTML = Icons.play; playBtn.setAttribute('aria-label', 'Play'); });
                if (audioWrap.querySelector('.progress-wrap')) {
                    audioWrap.querySelector('.progress-wrap').addEventListener('click', (e) => {
                        if (!audio.duration) return;
                        const rect = e.currentTarget.getBoundingClientRect();
                        const pct = (e.clientX - rect.left) / rect.width;
                        audio.currentTime = pct * audio.duration;
                    });
                }
            }
        }
        updateStep(1);
    }

    // ── Page: PYQ ────────────────────────────────────────────────────────
    async function renderPYQ() {
        const subjects = await API.getSubjects();
        const pyqs = await API.getPYQ({});
        return `
            <div class="app-shell">
                ${renderLeftNav('pyq')}
                <div class="app-main">
                    ${renderTopBar('Resume', null)}
                    <div class="content-inner">
                        <div class="pyq-layout">
                            <div class="pyq-filters panel">
                                <label>Subject</label>
                                <select id="pyq-subject" class="field-select"><option value="">All</option>${subjects.map(s => `<option value="${s.id}">${s.code}</option>`).join('')}</select>
                                <label style="margin-top: var(--space-2);">Year</label>
                                <select id="pyq-year" class="field-select"><option value="">All</option><option value="2023">2023</option><option value="2022">2022</option></select>
                                <label style="margin-top: var(--space-2);">Difficulty</label>
                                <select id="pyq-difficulty" class="field-select"><option value="">All</option><option value="3">3+</option><option value="4">4+</option><option value="5">5</option></select>
                                <p class="muted" style="margin-top: var(--space-2);">Questions: <strong id="pyq-count">${pyqs.length}</strong></p>
                            </div>
                            <div class="pyq-list" id="pyq-list">${pyqs.map(q => `
                                <div class="pyq-card" data-id="${q.id}">
                                    <div class="pyq-meta"><span class="badge">${q.year}</span><span class="badge">Diff ${q.difficulty}/5</span><span class="badge">${q.marks} marks</span></div>
                                    <div class="pyq-question">${q.question_text}</div>
                                    <div class="pyq-actions">
                                        <button type="button" class="btn btn-ghost pyq-hint">💡 Hint</button>
                                        <button type="button" class="btn btn-secondary pyq-attempt">Practice Now</button>
                                        <button type="button" class="btn btn-ghost pyq-reveal">Reveal Solution</button>
                                    </div>
                                    <div class="hint-block hidden">${q.hint || 'Focus on key formulas.'}</div>
                                    <div class="solution-block hidden">${q.ai_solution || 'No AI solution available.'}</div>
                                </div>`).join('')}</div>
                        </div>
                    </div>
                </div>
            </div>`;
    }

    function bindPYQ(container) {
        if (!container) return;
        const subjectSelect = container.querySelector('#pyq-subject');
        const yearSelect = container.querySelector('#pyq-year');
        const difficultySelect = container.querySelector('#pyq-difficulty');
        const list = container.querySelector('#pyq-list');
        const countEl = container.querySelector('#pyq-count');
        async function refresh() {
            const params = {};
            if (subjectSelect?.value) params.subject = subjectSelect.value;
            if (yearSelect?.value) params.year = yearSelect.value;
            if (difficultySelect?.value) params.difficulty = difficultySelect.value;
            const data = await API.getPYQ(params);
            if (countEl) countEl.textContent = data.length;
            if (list) {
                list.innerHTML = data.map(q => `
                    <div class="pyq-card" data-id="${q.id}">
                        <div class="pyq-meta"><span class="badge">${q.year}</span><span class="badge">Diff ${q.difficulty}/5</span></div>
                        <div class="pyq-question">${q.question_text}</div>
                        <div class="pyq-actions">
                            <button type="button" class="btn btn-ghost pyq-hint">💡 Hint</button>
                            <button type="button" class="btn btn-ghost pyq-reveal">Reveal Solution</button>
                        </div>
                        <div class="hint-block hidden">${q.hint || '—'}</div>
                        <div class="solution-block hidden">${q.ai_solution || 'No AI solution.'}</div>
                    </div>`).join('');
                list.querySelectorAll('.pyq-hint').forEach(btn => {
                    btn.addEventListener('click', () => { btn.closest('.pyq-card').querySelector('.hint-block').classList.toggle('hidden'); });
                });
                list.querySelectorAll('.pyq-reveal').forEach(btn => {
                    btn.addEventListener('click', () => { btn.closest('.pyq-card').querySelector('.solution-block').classList.toggle('hidden'); });
                });
            }
        }
        subjectSelect?.addEventListener('change', refresh);
        yearSelect?.addEventListener('change', refresh);
        difficultySelect?.addEventListener('change', refresh);
    }

    // ── Page: Analytics ───────────────────────────────────────────────────
    async function renderAnalytics() {
        const overview = await API.getAnalyticsOverview();
        const radar = overview?.radar || SEED.analytics.radar;
        const histogram = overview?.histogram_7d || SEED.analytics.histogram_7d || [0,0,0,0,0,0,0];
        const stability = overview?.stability || SEED.analytics.stability;
        const grid = overview?.mastery_grid || SEED.analytics.mastery_grid;
        const labels = radar?.labels || [];
        const values = radar?.values || [];
        const maxVal = Math.max(...values, 1);
        const radarSvg = (() => {
            const n = labels.length;
            if (n < 3) return '<p class="muted">Not enough data</p>';
            const cx = 200; const cy = 150; const r = 100;
            const points = values.map((v, i) => {
                const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
                const x = cx + r * (v / maxVal) * Math.cos(angle);
                const y = cy + r * (v / maxVal) * Math.sin(angle);
                return `${x},${y}`;
            });
            const axisLines = labels.map((_, i) => {
                const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
                const x2 = cx + r * Math.cos(angle);
                const y2 = cy + r * Math.sin(angle);
                return `<line x1="${cx}" y1="${cy}" x2="${x2}" y2="${y2}" stroke="var(--border-default)" stroke-width="1"/>`;
            }).join('');
            const poly = `<polygon points="${points.join(' ')}" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="2"/>`;
            const labelEls = labels.map((l, i) => {
                const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
                const x = cx + (r + 20) * Math.cos(angle);
                const y = cy + (r + 20) * Math.sin(angle);
                return `<text x="${x}" y="${y}" text-anchor="middle" font-size="10" fill="var(--text-muted)">${l}</text>`;
            }).join('');
            return `<svg class="radar-chart" viewBox="0 0 400 300" aria-label="Domain mastery radar">${axisLines}${poly}${labelEls}</svg>`;
        })();
        const maxBar = Math.max(...histogram, 1);
        const barsHtml = histogram.map((h, i) => `<div class="histogram-bar" style="height:${(h / maxBar) * 100}%" title="Day ${i + 1}: ${h} sessions"></div>`).join('');
        const tableRows = (grid || []).map(r => `<tr><td>${r.code}</td><td>${r.subject}</td><td>${((r.mastery || 0) * 100).toFixed(0)}%</td><td>${r.topics_done || 0}/${r.total || 0}</td></tr>`).join('');
        return `
            <div class="app-shell">
                ${renderLeftNav('analytics')}
                <div class="app-main">
                    ${renderTopBar('Resume', overview?.neural_index != null ? Number(overview.neural_index).toFixed(2) : null)}
                    <div class="content-inner">
                        <h1>Reflection</h1>
                        <p class="muted">How am I improving over time?</p>
                        <div class="analytics-summary" style="margin-top: var(--space-3);">
                            <div class="card"><span class="muted">Neural Index</span><strong data-tooltip="Composite measure of consistency and mastery growth">${overview?.neural_index != null ? Number(overview.neural_index).toFixed(2) : '—'}</strong></div>
                            <div class="card"><span class="muted">Sessions (7d)</span><strong>${overview?.sessions_7d ?? 0}</strong></div>
                            <div class="card"><span class="muted">Avg Accuracy</span><strong>${overview?.avg_accuracy ?? '—'}%</strong></div>
                            <div class="card"><span class="muted">Weekly Delta</span><strong>${overview?.weekly_delta != null ? (overview.weekly_delta >= 0 ? '+' : '') + Number(overview.weekly_delta).toFixed(2) : '—'}</strong></div>
                        </div>
                        <div class="grid grid-12" style="margin-top: var(--space-4);">
                            <div class="panel radar-container">
                                <h2 class="panel-title">Subject Mastery Radar</h2>
                                <div class="radar-container">${radarSvg}</div>
                            </div>
                            <div class="panel">
                                <h2 class="panel-title">7-Day Study Histogram</h2>
                                <div class="histogram" aria-label="Study sessions per day">${barsHtml}</div>
                            </div>
                        </div>
                        <div class="panel" style="margin-top: var(--space-4);">
                            <h2 class="panel-title">Neural Stability Matrix</h2>
                            <table class="mastery-table"><thead><tr><th>Code</th><th>Subject</th><th>Mastery</th><th>Topics</th></tr></thead><tbody>${tableRows}</tbody></table>
                        </div>
                    </div>
                </div>
            </div>`;
    }

    // ── Page: Admin ───────────────────────────────────────────────────────
    function renderAdmin() {
        return `
            <div class="app-shell">
                ${renderLeftNav('admin')}
                <div class="app-main">
                    ${renderTopBar('Resume', null)}
                    <div class="content-inner admin-section">
                        <h1>Admin</h1>
                        <p class="muted">Protected utilities. Backend JWT required for real actions.</p>
                        <div class="panel" style="margin-top: var(--space-3);">
                            <h2>Integration Notes</h2>
                            <p>Use <code>Authorization: Bearer &lt;token&gt;</code> for API calls. On 401, clear token and redirect to landing.</p>
                            <p>Store token in <code>localStorage.nh_token</code> and user in <code>localStorage.nh_user</code> after login.</p>
                        </div>
                    </div>
                </div>
            </div>`;
    }

    // ── Render & Route ────────────────────────────────────────────────────
    async function render() {
        const app = document.getElementById('app');
        if (!app) return;
        const route = parseHash();
        const parts = route.parts;
        let html = '';
        if (parts.length === 0 || (parts.length === 1 && parts[0] === '')) {
            html = renderLanding();
        } else if (parts[0] === 'app') {
            html = await renderAppHome();
        } else if (parts[0] === 'subject' && route.subjectId && !route.isLesson) {
            html = await renderStudyPath(route.subjectId);
        } else if (parts[0] === 'subject' && route.subjectId && route.topicId && route.isLesson) {
            html = await renderLessonMode(route.subjectId, route.topicId);
        } else if (parts[0] === 'pyq') {
            html = await renderPYQ();
        } else if (parts[0] === 'analytics') {
            html = await renderAnalytics();
        } else if (parts[0] === 'admin') {
            html = renderAdmin();
        } else {
            html = renderLanding();
        }
        app.innerHTML = html;

        // Bind events
        const themeToggle = app.querySelector('#theme-toggle');
        if (themeToggle) themeToggle.addEventListener('click', () => { Theme.cycle(); toast('Theme: ' + Theme.get()); });
        const navLogout = app.querySelector('#nav-logout');
        if (navLogout) navLogout.addEventListener('click', (e) => { e.preventDefault(); localStorage.removeItem('nh_token'); localStorage.removeItem('nh_user'); window.location.hash = '#/'; });
        const tryDemo = app.querySelector('#try-demo');
        if (tryDemo) {
            tryDemo.addEventListener('click', () => {
                const subjectId = SEED.subjects[0]?.id || '1';
                const topicId = (SEED.topics[subjectId] || [])[0]?.id || 't1';
                window.location.hash = `#/subject/${subjectId}/topic/${topicId}/lesson`;
            });
        }
        if (route.isLesson && route.topicId) {
            bindLessonMode(app.querySelector('#lesson-mode'), route.subjectId, route.topicId);
        }
        if (parts[0] === 'pyq') bindPYQ(app);
        if (parts[0] === 'app') {
            const subjectTabs = app.querySelector('#home-subject-tabs');
            const roadmapList = app.querySelector('#roadmap-list');
            if (subjectTabs) {
                subjectTabs.querySelectorAll('.subject-tab').forEach(tab => {
                    tab.addEventListener('click', async () => {
                        subjectTabs.querySelectorAll('.subject-tab').forEach(t => t.classList.remove('active'));
                        tab.classList.add('active');
                        const id = tab.dataset.id;
                        const topics = SEED.topics[id] || [];
                        if (roadmapList) {
                            roadmapList.innerHTML = topics.slice(0, 8).map((t, i) => {
                                const done = (parseFloat(t.mastery_score) || 0) >= 0.7;
                                return `<li class="roadmap-item ${done ? 'done' : ''}" data-subject-id="${id}" data-topic-id="${t.id}"><span class="roadmap-status">${done ? '✓' : i + 1}</span><span>${t.name}</span><span class="muted">${t.est_min || 20}m</span></li>`;
                            }).join('');
                            roadmapList.querySelectorAll('.roadmap-item').forEach(item => {
                                item.addEventListener('click', () => {
                                    window.location.hash = `#/subject/${item.dataset.subjectId}/topic/${item.dataset.topicId}/lesson`;
                                });
                            });
                        }
                    });
                });
            }
            roadmapList?.querySelectorAll('.roadmap-item').forEach(item => {
                item.addEventListener('click', () => {
                    window.location.hash = `#/subject/${item.dataset.subjectId}/topic/${item.dataset.topicId}/lesson`;
                });
            });
        }
        if (parts[0] === 'subject' && !route.isLesson) {
            const subjectSelect = app.querySelector('#sp-subject-select');
            const unitTree = app.querySelector('#unit-tree');
            subjectSelect?.addEventListener('change', () => { window.location.hash = '#/subject/' + subjectSelect.value; });
            unitTree?.querySelectorAll('.topic-item').forEach(btn => {
                btn.addEventListener('click', () => {
                    const tid = btn.dataset.topicId;
                    const sid = subjectSelect?.value || route.subjectId;
                    window.location.hash = `#/subject/${sid}/topic/${tid}`;
                });
            });
            unitTree?.querySelectorAll('.unit-header').forEach(h => {
                h.addEventListener('click', () => {
                    const next = h.nextElementSibling;
                    if (next) next.classList.toggle('hidden');
                    h.setAttribute('aria-expanded', h.getAttribute('aria-expanded') === 'true' ? 'false' : 'true');
                });
            });
        }
    }

    window.addEventListener('hashchange', render);
    window.addEventListener('load', () => {
        Theme.init();
        render();
    });
})();
