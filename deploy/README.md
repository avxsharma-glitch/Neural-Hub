# NEURAL HUB // AVX — Frontend

Guided Engineering Mastery System. Single-page application (vanilla HTML, CSS, JavaScript).

## Run instructions

- **Option A — Static server (recommended)**  
  From the `deploy` folder (or project root with deploy as static path):
  ```bash
  npx serve deploy
  ```
  Or with Python:
  ```bash
  cd deploy && python -m http.server 8080
  ```
  Then open: `http://localhost:8080` (or the port shown).

- **Option B — Direct file**  
  Open `deploy/index.html` in a browser. API calls will fail; the app uses **mock/seed data** and works in demo mode without a backend.

## Backend integration

- Set the API base before loading the app, e.g. in `index.html`:
  ```html
  <script>
    window.API_BASE = 'http://localhost:3000/api';
    window.USE_MOCK = false;  // optional; if true, falls back to mock on error
  </script>
  <script src="app.js"></script>
  ```
- **JWT**: After login, store the token in `localStorage.nh_token` and user in `localStorage.nh_user`. The app sends `Authorization: Bearer <token>` on requests. On **401**, it clears token/user and shows a toast; you can redirect to landing or a login view.
- **Endpoints** the frontend calls:
  - `GET /api/subjects`
  - `GET /api/subjects/:id/units`
  - `GET /api/topics/:id`
  - `GET /api/topics/:id/lesson` → `{ explanation, formulas, examples, practice[], audio_path }`
  - `POST /api/study-sessions` → `{ userId, topicId, duration, accuracy }`
  - `GET /api/pyq?subject=&year=&difficulty=`
  - `GET /api/analytics/overview` and `GET /api/analytics/overview/:subjectId`

## Manual QA checklist

- [ ] **Landing**: Hero and feature grid render; "Get Started" goes to `#/app`; "Try Demo" opens Lesson Mode with a sample topic (no auth).
- [ ] **Auth / token**: With a valid JWT in `nh_token`, app requests subjects and Study Path; 401 clears token and shows toast.
- [ ] **App home**: "Today's Study Plan" shows Continue Learning hero, roadmap per subject, high priority list, weekly stats (mock if no API).
- [ ] **Study Path**: Subject select and unit tree load; selecting a topic shows the topic card and "Start Lesson" navigates to lesson.
- [ ] **Lesson Mode**: Full-screen overlay; step progress (e.g. Step 1 of 6); sections: Explanation, Formulas, Visual, Worked Example, Practice, Mini Quiz; "Mark Complete" logs session (mock/API); keyboard ←/→ moves steps; focus indicators visible.
- [ ] **PYQ**: Filters (subject, year, difficulty) update list; cards show question, Hint, Practice Now, Reveal Solution (AI solution when present).
- [ ] **Analytics**: Radar chart (SVG), 7-day histogram, Neural Stability Matrix table from mock or API.
- [ ] **Admin**: Page loads (protected route); integration notes visible.
- [ ] **Theme**: Theme toggle (dark/light) works and persists in `localStorage`.
- [ ] **Accessibility**: Keyboard navigation, ARIA where needed, focus styles not relying only on color; contrast meets WCAG AA where required.

## Files

- `index.html` — Shell and roots for app, toasts, modals.
- `styles.css` — SHCIE design tokens, layout, components.
- `app.js` — Router, API layer, mock data, all pages and components.
- `assets/` — Optional: icons, fonts, sample audio (audio player supports `audio_path` from lesson API).

## Lighthouse

Aim for Performance ≥ 50 and Accessibility ≥ 90 when running against a served build (not `file://`).
