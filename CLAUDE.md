# CLAUDE.md — Claude Code Instructions for OTBL CMS

## Commit & Push Policy

**After every new feature, fix, or meaningful change — always commit AND push to origin.**

```bash
git add <changed files>
git commit -m "type: description

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
git push origin main
```

Commit message types: `feat`, `fix`, `refactor`, `docs`, `chore`, `style`

Never leave changes uncommitted after completing a task.

---

## Project Context

**OTBL CMS** — Full-stack utility management platform for a power/electricity company.

- **Backend:** Node.js + Express 5, Sequelize ORM v6, SQLite 3 — runs on port 3000
- **Frontend:** Vue 3 + Vite + TypeScript, Pinia, Vue Router — served by Vite dev or built to `dist/`
- **Remote:** `https://github.com/mominulIslam135/cms.git` (origin/main)

---

## Architecture

MVC pattern. All backend code lives in `backend/src/`. Frontend is a Vue 3 SPA in `frontend/src/`.

```
backend/src/
  controllers/   ← request handlers (27 files)
  models/        ← Sequelize models (30 files)
  routes/        ← Express routers (27 files)
  services/      ← business logic (AI, Telegram, CSV, PDF, estimation)
  middleware/    ← authMiddleware.js (JWT), apiKeyAuth.js
  config/        ← database.js

frontend/src/
  views/         ← page components (40+)
  components/    ← reusable UI
  stores/        ← Pinia (auth.ts)
  router/        ← index.ts (70+ routes with role guards)
  api.ts         ← all Axios API calls
```

---

## Key Rules

### Role-Based Access
5 roles: `Super Admin > Admin > Manager > Agent > User`
- Always respect route `meta.roles` on frontend
- Always use `hasRole(...)` middleware on backend routes

### CMO API Integration
- Token is cached in-memory with a mutex (`loginPromise`) — do NOT add concurrent login calls
- Batch uploads: frontend sends 5,000 rows/request → backend splits into 500/CMO API call
- On 401 from CMO API: clear `cachedToken` and `tokenExpiry` so next request retries login

### Database
- SQLite in production — avoid raw SQL where Sequelize ORM works
- Never commit `database.sqlite` or `DB-backup/` (already gitignored)
- Run migrations via `backend/scripts/migrate.sh` or `npm run migrate`

### Frontend Patterns
- API calls go in `frontend/src/api.ts` — never call axios directly in components
- Pinia store (`auth.ts`) handles JWT and user state
- Use Tailwind CSS + Bootstrap 5 — keep UI consistent with existing gradient/card style

### File Organisation
- Developer docs → `docs/`
- Backend utility/setup scripts → `backend/scripts/`
- Never commit `.env`, `node_modules/`, `*.sqlite`, `backend/uploads/*`, `backend/temp/`

---

## Common Tasks

### Add a new API endpoint
1. Create/update controller in `backend/src/controllers/`
2. Add route in `backend/src/routes/`
3. Register route in `backend/src/routes/index.js` if new file
4. Add API function in `frontend/src/api.ts`
5. Use in Vue component

### Add a new page
1. Create view in `frontend/src/views/`
2. Add route in `frontend/src/router/index.ts` with appropriate `meta.roles`
3. Add nav link in `frontend/src/components/Sidebar.vue`

### Run locally
```bash
# Backend
cd backend && npm start

# Frontend
cd frontend && npm run dev
```
