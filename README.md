# NEURAL HUB // AVX

**Guided AKTU B.Tech First-Year Engineering Mastery System**

A structured academic intelligence platform built for AKTU students. Replaces passive dashboards with an actionable learning loop: **Home → Study Path → Lesson → Practice → Analytics**.

---

## Features

### 🏠 Home — Today's Plan
- **Continue Learning** hero card with highest-priority next topic
- Study roadmap with topic completion indicators
- Auto-computed high-priority topics (importance ≥ 4 × mastery < 60%)
- Weekly progress summary (sessions, accuracy, topics done)

### 📚 Study Path
- Per-subject unit tree with mastery status dots
- Topic card: importance stars, difficulty, estimated time, mastery bar, concept tags, PYQ preview

### 🧠 Lesson Mode (5-Step Flow)
1. Concept Explanation
2. Key Formulas
3. Visual Diagram Placeholder
4. Worked Example
5. Mini Quiz (3 MCQs) + Self-Evaluation (Unsure / Got it / Confident)

Self-eval logs a study session and updates mastery score.

### 📝 Practice
- Full PYQ archive with difficulty filtering
- 💡 Hint system (amber callout)
- Step-by-step solution reveal
- Self-evaluation after each question

### 📊 Analytics (Reflection)
- Radar chart across all subjects
- 7-day cognitive stability history
- Full subject mastery table with progress bars

### 🧠 Intelligence Engine
Deterministic, rule-based (no AI required to function):
- `frequency_score` — based on PYQ count
- `exam_priority_score` — importance × frequency
- Weak cluster detection — mastery < 0.6 & importance ≥ 4
- `NeuralIndex` — composite performance score

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Vanilla HTML, CSS, JavaScript |
| Backend | Node.js, Express.js |
| Database | PostgreSQL |
| Auth | JWT (jsonwebtoken) + bcrypt |
| AI (optional) | Google Gemini API |

---

## Setup

### Prerequisites
- Node.js 18+
- PostgreSQL 14+

### 1. Clone & Install

```bash
git clone https://github.com/avxsharma-glitch/Neural-Hub.git
cd Neural-Hub
npm install
```

### 2. Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/neuralhub
PORT=3000
JWT_SECRET=your_jwt_secret_here
GEMINI_API_KEY=your_gemini_key_here   # optional, for AI explanations
```

### 3. Database Setup

```bash
node database/create-db.js
node database/schema.sql     # or run schema.sql manually in psql
node database/migrate.js
node database/migrate-intelligence.js
```

### 4. Seed Curriculum Data

```bash
node database/seed.js
```

Seeds 10 AKTU subjects (Chemistry, Physics, Maths I & II, BEE, C Programming, Mechanical, EVS, Soft Skills, Electronics) with topics, concept tags, and PYQs.

### 5. Run Intelligence Pipeline

```bash
# Create admin user first, then:
node database/reset-password.js
```

### 6. Start the Server

```bash
node backend/index.js
```

Open **http://localhost:3000** in your browser.

Default admin: `admin@neuralhub.ktu` / `admin123`

---

## Project Structure

```
Neural-Hub/
├── backend/
│   ├── config/db.js
│   ├── controllers/        # Auth, Analytics, AI, Admin
│   ├── middleware/         # JWT auth, admin guard
│   ├── routes/             # Express routers
│   └── services/
│       ├── aiGeneration.service.js
│       └── intelligence.service.js   # Deterministic scoring engine
├── database/
│   ├── schema.sql
│   ├── seeds/              # 10 × subject JSON files
│   └── migrate-intelligence.js
├── frontend/
│   ├── index.html
│   ├── css/style.css
│   └── js/
│       ├── api.js          # All fetch calls
│       ├── auth.js         # Login / Register
│       ├── ui.js           # DOM renderers
│       └── app.js          # Main app controller
└── package.json
```

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/register` | Register |
| GET | `/api/subjects` | All subjects |
| GET | `/api/topics/:subjectId` | Topics by subject |
| GET | `/api/pyq/:subjectId` | PYQs by subject |
| POST | `/api/ai/analyze-topic` | AI concept analysis |
| POST | `/api/ai/solve-question` | AI PYQ solution |
| GET | `/api/analytics/overview` | Dashboard metrics |
| GET | `/api/analytics/radar` | Subject mastery data |
| POST | `/api/admin/run-intelligence-update` | Recompute all scores |

---

## License

MIT
