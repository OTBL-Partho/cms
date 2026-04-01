# OTBL CMS — Content Management System

A full-stack utility management platform for power/electricity company operations. Handles meter readings, billing analysis, CMO (Change Meter Owner) tracking, customer complaints, RC/DC operations, and team-based ticket management.

## Tech Stack

| Layer | Technologies |
|---|---|
| **Backend** | Node.js, Express 5, Sequelize ORM v6, SQLite 3 |
| **Frontend** | Vue 3, Vite, TypeScript, Pinia, Vue Router |
| **UI** | Bootstrap 5, Tailwind CSS |
| **Real-time** | Socket.IO v4 |
| **Auth** | JWT + bcryptjs |
| **Integrations** | Telegram Bot API, CMO External API, GROQ AI API |
| **Process** | PM2 |

## Project Structure

```
cms-main/
├── backend/
│   └── src/
│       ├── controllers/    # 27 request handlers
│       ├── models/         # 30 Sequelize models
│       ├── routes/         # 27 route files
│       ├── services/       # AI, Telegram, CSV, PDF, estimation
│       ├── middleware/     # Auth, role guards
│       ├── migrations/     # Sequelize DB migrations
│       └── config/         # Database config
│   └── scripts/            # Utility & setup scripts
├── frontend/
│   └── src/
│       ├── views/          # 40+ page components
│       ├── components/     # Reusable UI components
│       ├── stores/         # Pinia state (auth)
│       ├── router/         # Vue Router with role guards
│       └── api.ts          # Axios API client
├── docs/                   # Developer guides & documentation
└── scripts/                # Deployment scripts
```

## Modules

1. **Ticket Management** — JIRA-style Epic/Story/Task/Bug, Kanban board, sprints, time tracking
2. **Project & Team Management** — Role-based teams, sprint velocity
3. **Analytics & Reporting** — Org/Project/Sprint/RC-DC dashboards (Chart.js)
4. **Complaint Management** — Customer complaints, agent assignment, billing lookup
5. **CMO Integration** — External API proxy, batch upload (50k+ records), MDM entry tracking
6. **Meter & Billing** — TOD1/TOD2 readings, bill stop analysis, C2M uploads
7. **User Management** — 5 roles: Super Admin, Admin, Manager, Agent, User
8. **Real-time Notifications** — Socket.IO + Telegram bot
9. **Content Management** — CKEditor 5 rich text pages
10. **Connection Logs** — RC/DC reconnect/disconnect event tracking

## Getting Started

### Prerequisites
- Node.js 18+
- npm

### Backend Setup
```bash
cd backend
cp .env.example .env          # fill in your secrets
npm install
npm run migrate               # run DB migrations
npm start
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Environment Variables (backend/.env)
```
PORT=3000
JWT_SECRET=your_jwt_secret
CMO_API_URL=http://192.168.10.100:8085/api
CMO_API_USERNAME=your_username
CMO_API_PASSWORD=your_password
TELEGRAM_BOT_TOKEN=your_token
GROQ_API_KEY=your_key
```

## User Roles & Access

| Role | Access |
|---|---|
| **Super Admin** | Full access to all modules |
| **Admin** | All modules except Super Admin settings |
| **Manager** | Analytics, reports, meter tools, C2M upload |
| **Agent** | Tickets, complaints, customer support |
| **User** | Tickets, notifications, basic views |

## Deployment

See `docs/DEPLOYMENT.md` for full deployment instructions.

Quick deploy scripts:
- `dev-deploy.bat` — development deploy (Windows)
- `prod-update.bat` / `prod-update.sh` — production update

## Documentation

All developer guides are in the `docs/` folder:
- `DEPLOYMENT.md` — Server deployment guide
- `QUICK_START.md` — Quick start reference
- `MIGRATION-NOTES.md` — DB migration notes
- `RC_DC_JSON_API_Documentation.md` — RC/DC API reference
- `JIRA_UPGRADE_GUIDE.md` — Ticket system upgrade notes
