// UI logic module — Guided Mastery System

class UI {
    static switchView(viewId) {
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        const v = document.getElementById(viewId);
        if (v) v.classList.add('active');
    }

    static switchModule(moduleId) {
        document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
        const activeBtn = document.querySelector(`.nav-btn[data-target="${moduleId}"]`);
        if (activeBtn) activeBtn.classList.add('active');

        document.querySelectorAll('.module').forEach(m => {
            m.classList.remove('active');
            m.style.opacity = '0';
        });

        const mod = document.getElementById(moduleId);
        if (mod) {
            mod.classList.add('active');
            requestAnimationFrame(() => { mod.style.opacity = '1'; });
        }

        // Update header breadcrumb
        const titles = { home: "Today's Plan", 'study-path': 'Study Path', lesson: 'Lesson', practice: 'Practice', analytics: 'Reflection' };
        const title = document.getElementById('header-page-title');
        if (title) title.textContent = titles[moduleId] || '';
    }

    static drawRadarChart(data) {
        const container = document.getElementById('radar-chart');
        if (!container) return;
        if (!data || data.length < 3) {
            container.innerHTML = '<p class="placeholder-text">Log study sessions to populate the radar.</p>';
            return;
        }
        const size = 280, center = size / 2, radius = size * 0.38;
        let svg = `<svg width="100%" height="${size}" viewBox="0 0 ${size} ${size}">`;
        for (let l = 1; l <= 4; l++) {
            let pts = '';
            const r = (radius / 4) * l;
            for (let i = 0; i < data.length; i++) {
                const a = (Math.PI * 2 * i) / data.length - Math.PI / 2;
                pts += `${center + r * Math.cos(a)},${center + r * Math.sin(a)} `;
            }
            svg += `<polygon points="${pts}" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="1"/>`;
        }
        let dp = '';
        data.forEach((d, i) => {
            const a = (Math.PI * 2 * i) / data.length - Math.PI / 2;
            const r = radius * (Math.min(parseFloat(d.mastery) || 0, 100) / 100);
            dp += `${center + r * Math.cos(a)},${center + r * Math.sin(a)} `;
            const lx = center + (radius + 22) * Math.cos(a);
            const ly = center + (radius + 22) * Math.sin(a);
            svg += `<text x="${lx}" y="${ly}" fill="rgba(255,255,255,0.30)" font-size="9" font-family="JetBrains Mono" text-anchor="middle" alignment-baseline="middle">${d.name.substring(0, 5)}</text>`;
        });
        svg += `<polygon points="${dp}" fill="rgba(177,18,18,0.15)" stroke="rgba(177,18,18,0.50)" stroke-width="1.5"/>`;
        svg += `</svg>`;
        container.innerHTML = svg;
    }

    static drawMasteryGrid(data) {
        const container = document.getElementById('mastery-grid');
        if (!container) return;
        if (!data || data.length === 0) {
            container.innerHTML = '<p class="placeholder-text">No subjects found.</p>';
            return;
        }
        container.innerHTML = data.map(d => {
            const pct = parseFloat(d.progress || 0).toFixed(1);
            const weak = parseInt(d.weak_topics) || 0;
            const lastRev = d.last_revision
                ? new Date(d.last_revision).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
                : '—';
            return `
            <div class="mastery-row">
                <div>
                    <div class="mastery-subject-name" title="${d.name}">${d.name}</div>
                    <span class="mastery-subject-code">${d.code}</span>
                </div>
                <div class="mastery-progress-wrap">
                    <div class="progress-track"><div class="progress-fill" data-width="${pct}"></div></div>
                    <span class="mastery-pct">${pct}%</span>
                </div>
                <div class="mastery-weak">
                    <span class="count">${weak > 0 ? weak : '—'}</span>weak
                </div>
                <div class="mastery-date">${lastRev}</div>
                <button class="btn ghost-btn" style="font-size:12px;padding:6px 12px;" onclick="UI.switchModule('study-path')">Study →</button>
            </div>`;
        }).join('');
        requestAnimationFrame(() => {
            document.querySelectorAll('.progress-fill[data-width]').forEach(f => {
                requestAnimationFrame(() => { f.style.width = f.getAttribute('data-width') + '%'; });
            });
        });
    }

    static drawActivityFeed(data) {
        // no activity feed in new layout — analytics tab uses mastery grid
    }
}
