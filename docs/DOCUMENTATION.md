# OTBL CMS — Full Project Documentation

> **Version:** V3  
> **Last Updated:** April 2026  
> **Stack:** Vue 3 + Node.js/Express + SQLite + Socket.IO

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Technology Stack](#2-technology-stack)
3. [Architecture](#3-architecture)
4. [Directory Structure](#4-directory-structure)
5. [Environment Configuration](#5-environment-configuration)
6. [Database Schema](#6-database-schema)
7. [Authentication & Authorization](#7-authentication--authorization)
8. [Backend API Reference](#8-backend-api-reference)
9. [Controllers](#9-controllers)
10. [Services](#10-services)
11. [Middleware](#11-middleware)
12. [Frontend Architecture](#12-frontend-architecture)
13. [Frontend Pages & Views](#13-frontend-pages--views)
14. [State Management](#14-state-management)
15. [Real-time Communication](#15-real-time-communication)
16. [Modules & Features](#16-modules--features)
17. [External Integrations](#17-external-integrations)
18. [Deployment](#18-deployment)
19. [Known Limitations](#19-known-limitations)

---

## 1. Project Overview

**OTBL CMS** (Operational Technology Billing & Loading Content Management System) is a full-stack internal web application built for a utility/electricity distribution company. It unifies project/ticket management, team collaboration, customer billing operations, complaint handling, and operational reporting into a single platform with real-time notifications.

### Core Purposes

| Domain | What it does |
|---|---|
| Ticket Management | Jira-like issue tracking with sprints, epics, subtasks, time logs |
| Team & Project Management | Teams, projects, role-based membership, analytics |
| Billing Operations | Meter readings, replacements, bill stops, estimations, batch reports |
| Customer Management | Customer records, complaints, support centre |
| Content Management | Announcements, SOPs, project documents with rich text |
| Connection Logging | RC/DC (reconnect/disconnect) event tracking and reporting |
| Notifications | Real-time in-app + Telegram notifications |
| Data Import/Export | CSV, PDF, Excel upload and download |

---

## 2. Technology Stack

### Backend

| Layer | Technology | Version |
|---|---|---|
| Runtime | Node.js | LTS |
| Framework | Express.js | 5.1.0 |
| ORM | Sequelize | 6.37.7 |
| Database | SQLite3 | 5.1.7 |
| External DB | MSSQL (SQL Server) | 12.2.0 |
| Auth | jsonwebtoken + bcryptjs | 9.0.2 / 3.0.2 |
| Real-time | Socket.IO | 4.8.1 |
| File Upload | Multer | 2.0.2 |
| PDF Parsing | pdf-parse | 2.4.5 |
| PDF Generation | pdfkit | 0.17.1 |
| CSV Parsing | csv-parser, papaparse | 3.0.0 / 5.5.3 |
| Excel | xlsx | 0.18.5 |
| HTTP Client | axios | 1.11.0 |
| Telegram | node-telegram-bot-api | 0.66.0 |
| Process Manager | PM2 | ecosystem.config.js |

### Frontend

| Layer | Technology | Version |
|---|---|---|
| Framework | Vue 3 + TypeScript | latest |
| Build Tool | Vite | 7.0.6 |
| State Management | Pinia | 3.0.3 |
| Router | Vue Router | 4.5.1 |
| HTTP Client | Axios | 1.11.0 |
| CSS Frameworks | Tailwind CSS + Bootstrap | 3.4.18 / 5.3.7 |
| Charts | Chart.js + vue-chartjs | 4.5.0 / 5.3.2 |
| Rich Text Editor | CKEditor 5 | 41.4.2 |
| PDF Client | jsPDF + jspdf-autotable | 3.0.1 / 5.0.2 |
| Real-time | Socket.IO Client | 4.8.1 |
| Notifications | Vue Toastification | — |
| Data Export | PapaParse + xlsx | 5.5.3 / 0.18.5 |

---

## 3. Architecture

```
┌─────────────────────────────────────────────────┐
│                  Browser (Client)               │
│        Vue 3 SPA (TypeScript + Vite)            │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐  │
│  │  Views   │  │  Pinia   │  │ Socket.IO    │  │
│  │ (45+ pg) │  │  Stores  │  │   Client     │  │
│  └──────────┘  └──────────┘  └──────────────┘  │
│         │               │           │           │
│         └───────────────┴───────────┘           │
│                         │                       │
└─────────────────────────┼───────────────────────┘
                          │ HTTP / WebSocket
┌─────────────────────────┼───────────────────────┐
│                         ▼                       │
│          Express.js API Server (Node.js)        │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐  │
│  │  Routes  │→ │Controllers│→ │  Services    │  │
│  │ (27 grp) │  │ (28 files)│  │  (8 files)   │  │
│  └──────────┘  └──────────┘  └──────────────┘  │
│         │               │           │           │
│  ┌──────────────────────────────────────────┐   │
│  │            Sequelize ORM                 │   │
│  │          (29 Models / Relations)         │   │
│  └──────────────────────────────────────────┘   │
│         │                         │             │
└─────────┼─────────────────────────┼─────────────┘
          │                         │
    ┌─────▼──────┐        ┌─────────▼───────┐
    │  SQLite3   │        │   SQL Server    │
    │  (Primary) │        │ (OTBL_CMS Ext.) │
    └────────────┘        └─────────────────┘
```

### Request Flow

1. Vue Router intercepts navigation → auth guard checks Pinia store
2. Component calls function from `api.ts` (Axios + interceptors)
3. Axios attaches JWT `Authorization` header
4. Express routes `→` auth middleware (protect + role/resource check)
5. Controller receives request → calls service(s) if needed
6. Sequelize queries SQLite (or MSSQL for bill stop snapshots)
7. Response returned as JSON
8. Socket.IO emits events for real-time notifications to connected clients

---

## 4. Directory Structure

```
cms-main/
├── backend/
│   ├── src/
│   │   ├── app.js                     # Express app + Socket.IO init
│   │   ├── config/
│   │   │   └── database.js            # Sequelize SQLite configuration
│   │   ├── models/                    # 29 Sequelize model definitions
│   │   │   ├── index.js               # Model associations hub
│   │   │   ├── User.js
│   │   │   ├── Project.js
│   │   │   ├── Team.js
│   │   │   ├── TeamMember.js
│   │   │   ├── ProjectMember.js
│   │   │   ├── Ticket.js
│   │   │   ├── Sprint.js
│   │   │   ├── TicketHistory.js
│   │   │   ├── TicketLink.js
│   │   │   ├── TicketAttachment.js
│   │   │   ├── Comment.js
│   │   │   ├── CommentAttachment.js
│   │   │   ├── TimeLog.js
│   │   │   ├── MeterReading.js
│   │   │   ├── MeterReplacement.js
│   │   │   ├── Customer.js
│   │   │   ├── LastBillDate.js
│   │   │   ├── BillStop.js
│   │   │   ├── MdmRead.js
│   │   │   ├── DailyBillingReport.js
│   │   │   ├── BatchOperationalReport.js
│   │   │   ├── Complaint.js
│   │   │   ├── ComplaintCategory.js
│   │   │   ├── TelegramNotificationSetting.js
│   │   │   ├── Notification.js
│   │   │   ├── ConnectionLog.js
│   │   │   └── Content.js
│   │   ├── controllers/               # 28 controller files
│   │   ├── routes/                    # 27 route groups
│   │   ├── services/                  # 8 service modules
│   │   └── middleware/
│   │       ├── authMiddleware.js      # JWT + RBAC + resource access
│   │       └── apiKeyAuth.js         # API key authentication
│   ├── migrations/                    # Sequelize migration scripts
│   ├── seeders/                       # Database seeding scripts
│   ├── uploads/                       # Multer file storage
│   ├── package.json
│   ├── ecosystem.config.js            # PM2 config
│   └── .env                          # Environment variables
│
├── frontend/
│   ├── src/
│   │   ├── main.ts                   # Vue app init + Socket.IO
│   │   ├── App.vue                   # Root component
│   │   ├── api.ts                    # Axios API client (100+ functions)
│   │   ├── config.ts                 # API base URL config
│   │   ├── router/
│   │   │   └── index.ts             # Vue Router with auth guards
│   │   ├── stores/
│   │   │   ├── auth.ts              # Auth state (user, token, roles)
│   │   │   └── counter.ts           # Example store
│   │   ├── layouts/
│   │   │   ├── MainLayout.vue       # Authenticated layout (sidebar + navbar)
│   │   │   └── AuthLayout.vue       # Login/register layout
│   │   ├── views/                   # 45+ page components
│   │   ├── components/              # Reusable components
│   │   ├── assets/                  # CSS and images
│   │   └── types/                   # TypeScript type definitions
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── package.json
│
├── database.sqlite                    # SQLite database (~1.2 GB)
├── scripts/                          # Utility and deployment scripts
├── dev-deploy.bat                    # Windows dev deployment
├── prod-update.sh                    # Linux production update
├── migrate.sh                        # DB migration runner
└── [DOCUMENTATION.md, guides...]     # Project documentation
```

---

## 5. Environment Configuration

All backend environment variables live in `backend/.env`.

```env
# Server
PORT=3000

# JWT
JWT_SECRET=<your-secret-key>

# AI Integration
GROQ_API_KEY=<groq-api-key>

# Telegram Bot
TELEGRAM_BOT_TOKEN=<bot-token>
TELEGRAM_BOT_ENABLED=false
TELEGRAM_MODE=polling          # 'polling' or 'webhook'
TELEGRAM_WEBHOOK_URL=<url>
TELEGRAM_CHAT_ID=<chat-id>

# External CMO System
CMO_API_URL=<cmo-api-url>
CMO_API_USERNAME=<username>
CMO_API_PASSWORD=<password>

# SQL Server (External Bill Stop DB)
OTBL_CMS_DB_SERVER=<server>
OTBL_CMS_DB_DATABASE=<database>
OTBL_CMS_DB_USER=<user>
OTBL_CMS_DB_PASSWORD=<password>
```

**Frontend config** is in `frontend/src/config.ts`:
```ts
// Development
API_ORIGIN = 'http://localhost:3000'

// Production
API_ORIGIN = 'http://192.168.10.109:3000'
```

---

## 6. Database Schema

The application uses SQLite3 as its primary database, managed via Sequelize ORM. There are **29 models** organized into functional groups.

### 6.1 User & Access Control

#### `Users`
| Column | Type | Description |
|---|---|---|
| id | INTEGER PK | Auto-increment |
| name | STRING | Full name |
| email | STRING UNIQUE | Login email |
| password | STRING | bcrypt hashed |
| role | ENUM | `Super Admin`, `Admin`, `Manager`, `Agent`, `User` |
| avatar | STRING | Profile photo path |
| isActive | BOOLEAN | Account status |
| createdAt / updatedAt | DATE | Timestamps |

#### `ProjectMembers`
| Column | Type | Description |
|---|---|---|
| id | INTEGER PK | — |
| projectId | FK → Projects | — |
| userId | FK → Users | — |
| role | ENUM | `admin`, `member` |

#### `TeamMembers`
| Column | Type | Description |
|---|---|---|
| id | INTEGER PK | — |
| teamId | FK → Teams | — |
| userId | FK → Users | — |

---

### 6.2 Project & Team Management

#### `Projects`
| Column | Type | Description |
|---|---|---|
| id | INTEGER PK | — |
| name | STRING | Project name |
| key | STRING UNIQUE | Auto-generated short key (e.g., `PROJ`) |
| description | TEXT | — |
| status | ENUM | `active`, `inactive`, `archived` |
| leadId | FK → Users | Project lead |
| startDate / endDate | DATE | — |

#### `Teams`
| Column | Type | Description |
|---|---|---|
| id | INTEGER PK | — |
| name | STRING | Team name |
| description | TEXT | — |
| leaderId | FK → Users | Team leader |
| projectId | FK → Projects | Associated project |

#### `Sprints`
| Column | Type | Description |
|---|---|---|
| id | INTEGER PK | — |
| name | STRING | Sprint name |
| projectId | FK → Projects | — |
| status | ENUM | `Future`, `Active`, `Closed` |
| startDate / endDate | DATE | — |
| goal | TEXT | Sprint goal |
| completedPoints | INTEGER | Story points completed |

---

### 6.3 Ticket System

#### `Tickets`
| Column | Type | Description |
|---|---|---|
| id | INTEGER PK | — |
| ticketKey | STRING UNIQUE | e.g., `PROJ-001` |
| title | STRING | Ticket title |
| description | TEXT | Rich text |
| type | ENUM | `Epic`, `Story`, `Task`, `Bug`, `Subtask`, `Improvement`, `New Feature` |
| status | ENUM | `Backlog`, `To Do`, `In Progress`, `In Review`, `Testing`, `Done`, `Closed` |
| priority | ENUM | `Lowest`, `Low`, `Medium`, `High`, `Highest` |
| severity | ENUM | `Trivial`, `Minor`, `Major`, `Critical`, `Blocker` |
| storyPoints | INTEGER | Estimation |
| originalEstimate | FLOAT | Hours |
| remainingEstimate | FLOAT | Hours |
| timeSpent | FLOAT | Hours |
| projectId | FK → Projects | — |
| sprintId | FK → Sprints | — |
| assigneeId | FK → Users | — |
| reporterId | FK → Users | — |
| parentId | FK → Tickets | For subtasks |
| epicId | FK → Tickets | For epic grouping |
| dueDate | DATE | — |
| labels | JSON | Tag array |
| components | JSON | Component array |
| watchers | JSON | User ID array |
| isFlagged | BOOLEAN | Urgent flag |
| resolution | STRING | — |

#### `TicketHistory`
Audit trail — records every field change: `field`, `oldValue`, `newValue`, `changedBy`, `changedAt`.

#### `TicketLinks`
Dependencies between tickets: `sourceId`, `targetId`, `linkType` (blocks, is blocked by, relates to, duplicates).

#### `TicketAttachments`
File attachments: `ticketId`, `filename`, `originalName`, `path`, `size`, `mimeType`, `uploadedBy`.

#### `Comments`
| Column | Type | Description |
|---|---|---|
| id | INTEGER PK | — |
| ticketId | FK → Tickets | — |
| userId | FK → Users | Author |
| content | TEXT | Comment body |

#### `CommentAttachments`
Files on comments: `commentId`, `filename`, `path`, `size`, `mimeType`.

#### `TimeLogs`
| Column | Type | Description |
|---|---|---|
| id | INTEGER PK | — |
| ticketId | FK → Tickets | — |
| userId | FK → Users | Logger |
| timeSpent | FLOAT | Hours |
| description | TEXT | Work description |
| logDate | DATE | — |

---

### 6.4 Billing & Operations

#### `MeterReadings`
| Column | Type | Description |
|---|---|---|
| id | INTEGER PK | — |
| meter_no | STRING | Meter number (indexed) |
| reading_date | DATE | — |
| TOTAL_ENERGY | FLOAT | Total energy reading |
| TOD1_ENERGY | FLOAT | Time-of-day rate 1 |
| TOD2_ENERGY | FLOAT | Time-of-day rate 2 |
| is_estimated | BOOLEAN | Estimated vs actual |
| source | STRING | Data source |

#### `Customers`
| Column | Type | Description |
|---|---|---|
| id | INTEGER PK | — |
| customer_no | STRING UNIQUE | Customer number |
| name | STRING | — |
| meter_no | STRING | — |
| address | TEXT | — |
| connection_type | STRING | — |
| tariff | STRING | — |
| phone | STRING | — |
| email | STRING | — |
| status | STRING | Active / Inactive |
| ... | ... | 15+ additional fields |

#### `BillStop`
| Column | Type | Description |
|---|---|---|
| id | INTEGER PK | — |
| customer_no | STRING | — |
| meter_no | STRING | — |
| reason | TEXT | Stop reason |
| stop_date | DATE | — |
| resume_date | DATE | — |
| status | STRING | — |

#### `MeterReplacements`
| Column | Type | Description |
|---|---|---|
| id | INTEGER PK | — |
| old_meter_no | STRING | — |
| new_meter_no | STRING | — |
| customer_no | STRING | — |
| replacement_date | DATE | — |
| technician | STRING | — |
| notes | TEXT | — |

#### `DailyBillingReports`
Stores daily summary statistics: date, total_billed, total_customers, total_units, etc.

#### `BatchOperationalReports`
Batch processing reports: batch_id, processed_count, error_count, status, metadata (JSON).

---

### 6.5 Customer Support

#### `Complaints`
| Column | Type | Description |
|---|---|---|
| id | INTEGER PK | — |
| customer_no | STRING | — |
| category | FK → ComplaintCategories | — |
| description | TEXT | — |
| priority | ENUM | `Low`, `Medium`, `High`, `Critical` |
| status | ENUM | `Open`, `In Progress`, `Close` |
| assigneeId | FK → Users | Assigned agent |
| resolution | TEXT | — |

#### `ComplaintCategories`
Simple lookup: `id`, `name`, `description`.

---

### 6.6 System

#### `Notifications`
| Column | Type | Description |
|---|---|---|
| id | INTEGER PK | — |
| userId | FK → Users | Recipient |
| type | STRING | Notification type |
| title | STRING | — |
| message | TEXT | — |
| priority | ENUM | `low`, `medium`, `high`, `urgent` |
| category | ENUM | `ticket`, `comment`, `mention`, `system`, `status`, `assignment` |
| isRead | BOOLEAN | — |
| relatedId | INTEGER | Related resource ID |
| relatedType | STRING | Resource type |

#### `ConnectionLogs`
| Column | Type | Description |
|---|---|---|
| id | INTEGER PK | — |
| userId | FK → Users | — |
| eventType | STRING | `Connect`, `Reconnect`, `Disconnect` |
| ipAddress | STRING | — |
| userAgent | STRING | — |
| commandStatus | STRING | `COMPLETED`, `COMINPROG`, `DISCARDED`, `FAILED` |
| duration | INTEGER | Session duration (ms) |
| metadata | JSON | Extra event data |

#### `Contents`
| Column | Type | Description |
|---|---|---|
| id | INTEGER PK | — |
| title | STRING | — |
| body | TEXT | CKEditor rich HTML |
| type | ENUM | `Announcement`, `SOP`, `Document` |
| authorId | FK → Users | — |

#### `TelegramNotificationSettings`
Per-user Telegram settings: `userId`, `chatId`, `categories` (JSON array), `isEnabled`.

---

## 7. Authentication & Authorization

### Authentication Flow

```
POST /api/auth/login
  Body: { email, password }
  → bcrypt.compare(password, user.password)
  → jwt.sign({ id, role }, JWT_SECRET, { expiresIn: '7d' })
  ← { token, user }

Frontend:
  → stores token in Pinia (auth store) + localStorage
  → Axios interceptor attaches: Authorization: Bearer <token>
  → On 401 response: auto-logout + redirect to /login
```

### User Roles

| Role | Description | Access Level |
|---|---|---|
| **Super Admin** | Full platform access | All resources, all operations |
| **Admin** | System administration | User management, all projects |
| **Manager** | Project/team management | Assigned projects, reporting |
| **Agent** | Operational work | Tickets, complaints, billing |
| **User** | Limited access | Assigned tickets and resources |

### Authorization Middleware Functions

All exported from `backend/src/middleware/authMiddleware.js`:

| Function | Description |
|---|---|
| `protect()` | Verifies JWT token; attaches `req.user` |
| `hasRole(...roles)` | Checks user role is in allowed list |
| `canAccessProject()` | Validates ProjectMember record exists |
| `canAccessTicket()` | Checks ticket's project membership |
| `canModifyTeam()` | Validates team modification permission |
| `isTeamLeader()` | Checks user is the team's leader |
| `isTeamMember()` | Checks user is in the team |

> **Note:** Super Admin bypasses all resource-level restrictions.

---

## 8. Backend API Reference

All routes are prefixed with `/api`.

### 8.1 Authentication

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/auth/login` | Public | Login and get JWT |
| POST | `/auth/register` | Admin+ | Create new user |
| GET | `/auth/me` | Authenticated | Get current user profile |

### 8.2 Users

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/users` | Admin+ | List all users |
| POST | `/users` | Admin+ | Create user |
| GET | `/users/:id` | Authenticated | Get user by ID |
| PUT | `/users/:id` | Admin / Self | Update user |
| DELETE | `/users/:id` | Super Admin | Delete user |

### 8.3 Projects

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/projects` | Authenticated | List accessible projects |
| POST | `/projects` | Manager+ | Create project |
| GET | `/projects/:id` | Project member | Get project details |
| PUT | `/projects/:id` | Project admin | Update project |
| DELETE | `/projects/:id` | Super Admin | Delete project |
| POST | `/projects/:id/members` | Project admin | Add member |
| DELETE | `/projects/:id/members/:userId` | Project admin | Remove member |

### 8.4 Teams

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/teams` | Authenticated | List teams |
| POST | `/teams` | Manager+ | Create team |
| GET | `/teams/:id` | Team member | Get team |
| PUT | `/teams/:id` | Team leader / Admin | Update team |
| POST | `/teams/:id/members` | Team leader | Add member |
| DELETE | `/teams/:id/members/:userId` | Team leader | Remove member |

### 8.5 Tickets

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/tickets` | Project member | List tickets (filterable) |
| POST | `/tickets` | Project member | Create ticket |
| GET | `/tickets/:id` | Project member | Get ticket detail |
| PUT | `/tickets/:id` | Project member | Update ticket |
| DELETE | `/tickets/:id` | Reporter / Admin | Delete ticket |
| POST | `/tickets/:id/assign` | Manager+ | Assign ticket |
| POST | `/tickets/:id/flag` | Authenticated | Flag as urgent |
| POST | `/tickets/:id/link` | Project member | Link ticket |
| DELETE | `/tickets/:id/link/:linkId` | Project member | Remove link |
| POST | `/tickets/:id/comments` | Project member | Add comment |
| GET | `/tickets/:id/comments` | Project member | List comments |
| POST | `/tickets/:id/time-logs` | Authenticated | Log time |
| GET | `/tickets/:id/time-logs` | Project member | Get time logs |
| GET | `/tickets/:id/history` | Project member | Get change history |
| POST | `/tickets/:id/attachments` | Project member | Upload attachment |
| DELETE | `/tickets/:id/attachments/:attId` | Owner / Admin | Delete attachment |

### 8.6 Sprints

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/sprints` | Project member | List sprints |
| POST | `/sprints` | Manager+ | Create sprint |
| GET | `/sprints/:id` | Project member | Get sprint |
| PUT | `/sprints/:id` | Manager+ | Update sprint |
| POST | `/sprints/:id/start` | Manager+ | Start sprint |
| POST | `/sprints/:id/complete` | Manager+ | Complete sprint |

### 8.7 Analytics

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/analytics` | Manager+ | Organization-wide stats |
| GET | `/analytics/project/:id` | Project member | Project analytics |
| GET | `/analytics/sprint/:id` | Project member | Sprint burndown & velocity |

### 8.8 Billing & Operations

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/meter-readings` | Agent+ | List meter readings |
| POST | `/meter-readings` | Agent+ | Create reading |
| POST | `/meter-readings/upload` | Agent+ | Bulk import CSV/Excel |
| GET | `/meter-replacement` | Agent+ | List replacements |
| POST | `/meter-replacement` | Agent+ | Create replacement |
| GET | `/bill-stop` | Agent+ | Bill stop analysis |
| GET | `/bill-stop/report` | Agent+ | Bill stop report |
| GET | `/customers` | Agent+ | Customer list |
| GET | `/customers/:id` | Agent+ | Customer detail |
| GET | `/daily-billing-report` | Manager+ | Daily billing reports |
| GET | `/batch-operational-report` | Manager+ | Batch reports |
| GET | `/cmo` | Agent+ | CMO data |

### 8.9 Complaints

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/complaints` | Agent+ | List complaints |
| POST | `/complaints` | Authenticated | Create complaint |
| GET | `/complaints/:id` | Agent+ | Get complaint |
| PUT | `/complaints/:id` | Agent+ | Update complaint |
| GET | `/complaint-categories` | Authenticated | List categories |
| POST | `/complaint-categories` | Admin+ | Create category |

### 8.10 Content

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/content` | Authenticated | List content |
| POST | `/content` | Manager+ | Create content |
| GET | `/content/:id` | Authenticated | Get content |
| PUT | `/content/:id` | Author / Admin | Update content |
| DELETE | `/content/:id` | Admin+ | Delete content |

### 8.11 Notifications

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/notifications` | Authenticated | Get user notifications |
| PUT | `/notifications/:id/read` | Authenticated | Mark as read |
| PUT | `/notifications/read-all` | Authenticated | Mark all as read |
| DELETE | `/notifications/:id` | Authenticated | Delete notification |

### 8.12 Telegram

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/telegram/webhook` | Public (bot) | Telegram webhook endpoint |
| GET | `/telegram-notifications` | Authenticated | Get Telegram settings |
| POST | `/telegram-notifications` | Authenticated | Save settings |
| PUT | `/telegram-notifications/:id` | Authenticated | Update settings |

### 8.13 Connection Logs

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/connection-logs` | Manager+ | List connection logs |
| GET | `/connection-logs/analytics` | Manager+ | RC/DC analytics |

### 8.14 Export

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/export/tickets` | Authenticated | Export tickets (PDF/Excel) |
| POST | `/export/analytics` | Manager+ | Export analytics report |

---

## 9. Controllers

| Controller File | Responsibility |
|---|---|
| `authController.js` | Login, register, JWT issuance |
| `userController.js` | User CRUD, profile updates |
| `projectController.js` | Project lifecycle, member management |
| `teamController.js` | Team creation, member assignment |
| `sprintController.js` | Sprint management, start/complete |
| `ticketController.js` | Full ticket lifecycle, assignment, links, flags |
| `commentController.js` | Ticket comments + attachments |
| `notificationController.js` | In-app notification CRUD |
| `analyticsController.js` | Aggregate queries for dashboards (largest ~23KB) |
| `complaintController.js` | Complaint tracking and assignment |
| `billStopController.js` | Bill stop analysis, SQL Server queries |
| `meterReadingController.js` | Meter reading import/processing |
| `meterReplacementController.js` | Replacement record management |
| `customerController.js` | Customer database CRUD |
| `contentController.js` | CMS content creation/management |
| `connectionLogController.js` | RC/DC session event tracking |
| `telegramNotificationController.js` | Telegram notification settings |
| `exportController.js` | PDF/Excel generation and download |
| `dailyBillingReportController.js` | Daily billing summary queries |
| `batchOperationalReportController.js` | Batch report management |
| `cmoController.js` | External CMO system data |

---

## 10. Services

| Service File | Purpose |
|---|---|
| `telegramBotService.js` | Telegram bot: file uploads (PDF/CSV), customer queries, polling/webhook modes |
| `telegramService.js` | Telegram message sending, group notifications, message formatting |
| `notificationService.js` | Creates in-app notifications for 10+ event types; emits Socket.IO events |
| `csvParserService.js` | Parses CSV files for meter reading bulk imports |
| `pdfParserService.js` | Extracts structured data from billing PDF documents |
| `readingProcessorService.js` | Processes and validates meter reading data |
| `estimationService.js` | Estimation algorithms for missing/gap meter readings |
| `aiService.js` | AI analysis via Groq API |

### Notification Types (`notificationService.js`)

| Type | Trigger |
|---|---|
| `ticket_assigned` | Ticket assigned to user |
| `ticket_reassigned` | Ticket reassigned |
| `status_changed` | Ticket status updated |
| `priority_changed` | Priority updated |
| `comment_added` | New comment on watched ticket |
| `mentioned` | User @mentioned in comment |
| `due_soon` | Ticket due within 24 hours |
| `overdue` | Ticket past due date |
| `project_assigned` | User added to project |
| `ticket_created` | New ticket in project |

---

## 11. Middleware

### `authMiddleware.js`

Located at `backend/src/middleware/authMiddleware.js` (~245 lines).

```js
// Attach to routes like:
router.get('/resource', protect, hasRole('Admin', 'Manager'), controller);
router.get('/ticket/:id', protect, canAccessTicket(), controller);
```

All middleware functions:

```
protect()           → Validates JWT; populates req.user
hasRole(...roles)   → Validates req.user.role is in allowed list
canAccessProject()  → Checks ProjectMember row exists for req.user + :projectId
canAccessTicket()   → Loads ticket, then checks project membership
canModifyTeam()     → Validates team leader or admin status
isTeamLeader()      → Strict team leader check
isTeamMember()      → Validates TeamMember record
```

### `apiKeyAuth.js`

Alternative API key authentication for service-to-service or external integrations.

---

## 12. Frontend Architecture

### `api.ts` — Centralized API Client

All HTTP calls go through `frontend/src/api.ts`, which:
- Creates an Axios instance pointing to `config.API_ORIGIN`
- Attaches `Authorization: Bearer <token>` from `localStorage` via request interceptor
- Handles 401 responses by clearing auth state and redirecting to `/login`
- Exports **100+ named functions**, one per API operation

Example pattern:
```ts
export const getTickets = (params) => api.get('/tickets', { params })
export const createTicket = (data) => api.post('/tickets', data)
export const updateTicket = (id, data) => api.put(`/tickets/${id}`, data)
```

### `router/index.ts` — Vue Router

- Uses `createWebHistory` for clean URLs
- **Auth guard** (`beforeEach`): checks `auth.isAuthenticated`; redirects unauthenticated users to `/login`
- **Role guards** on specific routes (e.g., Admin-only pages)
- All authenticated routes use `MainLayout`; auth pages use `AuthLayout`

### Component Architecture

```
App.vue
├── AuthLayout.vue          → Login, Register pages
└── MainLayout.vue          → All authenticated pages
    ├── Sidebar.vue         → Navigation links, role-aware menu items
    ├── ThemeToggle.vue     → Dark/light mode
    └── <router-view>       → Dynamic page content
        ├── Views/          → Page-level components
        └── Components/     → Reusable sub-components
```

---

## 13. Frontend Pages & Views

### Authentication

| Page | Route | Description |
|---|---|---|
| `LoginView` | `/login` | Email/password login |
| `RegisterView` | `/register` | User registration (Admin only) |
| `ProfileView` | `/profile` | User profile editing |

### Core Dashboard

| Page | Route | Description |
|---|---|---|
| `HomeView` | `/` | Landing / home |
| `DashboardView` | `/dashboard` | Main dashboard |
| `OrganizationDashboard` | `/org-dashboard` | Org-wide analytics |

### Ticket Management

| Page | Route | Description |
|---|---|---|
| `TicketListView` | `/tickets` | Filterable ticket list |
| `TicketBoardView` | `/tickets/board` | Kanban board by status |
| `TicketCreateView` | `/tickets/create` | Create ticket form |
| `TicketDetailView` | `/tickets/:id` | Full ticket detail with history |
| `TicketListViewEnhanced` | `/tickets/enhanced` | Enhanced list with bulk ops |
| `TicketBoardViewEnhanced` | `/tickets/board-enhanced` | Enhanced Kanban |

### Project & Sprint Analytics

| Page | Route | Description |
|---|---|---|
| `ProjectAnalytics` | `/analytics/project/:id` | Burndown, velocity, status breakdown |
| `SprintAnalytics` | `/analytics/sprint/:id` | Sprint-level metrics |
| `RCDCAnalytics` | `/analytics/rcdc` | Connection/disconnection analytics |

### Admin & Management

| Page | Route | Description |
|---|---|---|
| `AdminPageView` | `/admin` | Admin control panel |
| `ManagerPageView` | `/manager` | Manager dashboard |
| `SettingsView` | `/settings` | System settings |
| `UserCreateView` | `/users/create` | Create new user |
| `NotificationsView` | `/notifications` | Notification inbox |

### Billing Operations

| Page | Route | Description |
|---|---|---|
| `BillStopView` | `/bill-stop` | Bill stop search/analysis |
| `BillStopReportView` | `/bill-stop/report` | Bill stop detailed report |
| `BillingProfileView` | `/billing-profile` | Customer billing profile |
| `MeterReplacementView` | `/meter-replacement` | Meter replacement records |
| `MeterEstimatorView` | `/meter-estimator` | Estimation tool |
| `C2MUploadView` | `/c2m-upload` | C2M data upload |
| `DataUploadView` | `/data-upload` | Generic data upload |
| `DataFetchingView` | `/data-fetching` | Data retrieval interface |
| `CustomerView` | `/customers` | Customer database |

### Complaints & Support

| Page | Route | Description |
|---|---|---|
| `ComplaintsView` | `/complaints` | Complaint list and management |
| `ComplaintReportsView` | `/complaints/reports` | Complaint analytics |
| `CustomerSupportCenterView` | `/support` | Full support centre |
| `TelegramNotificationsView` | `/telegram-notifications` | Telegram settings |

### Content Management

| Page | Route | Description |
|---|---|---|
| `ContentListView` | `/content` | Announcements, SOPs, Documents list |
| `ContentCreateView` | `/content/create` | Create with CKEditor |
| `ContentDetailView` | `/content/:id` | View content |
| `SopView` | `/sop` | SOP listing |

### Batch & Operations

| Page | Route | Description |
|---|---|---|
| `BatchOperationalReportView` | `/batch-report` | Batch operation reports |
| `CmoView` | `/cmo` | CMO data viewer |

### Misc

| Page | Route | Description |
|---|---|---|
| `AboutView` | `/about` | About page |
| `NotFoundView` | `/:catchAll` | 404 page |

---

## 14. State Management

### `stores/auth.ts` (Pinia)

Primary store for authentication state.

**State:**
```ts
user: User | null        // Current user object
token: string | null     // JWT token
isAuthenticated: boolean // Derived
```

**Actions:**
```ts
login(email, password)   // Calls API, stores token
logout()                 // Clears state + localStorage
fetchCurrentUser()       // GET /auth/me on app load
```

**Getters:**
```ts
isAdmin          // role === 'Admin' || 'Super Admin'
isSuperAdmin     // role === 'Super Admin'
isManager        // role === 'Manager' || above
isAgent          // role === 'Agent' || above
```

The token is persisted to `localStorage` so the user stays logged in across browser refreshes.

---

## 15. Real-time Communication

Socket.IO is used for real-time events throughout the application.

### Backend Setup (`app.js`)
```js
const io = new Server(server, { cors: { origin: '*' } })

io.on('connection', (socket) => {
  // User joins their own room using userId
  socket.on('join', (userId) => socket.join(`user:${userId}`))
})
```

### Emitting Events (from `notificationService.js`)
```js
io.to(`user:${userId}`).emit('notification', notificationData)
```

### Frontend Setup (`main.ts`)
```ts
import { io } from 'socket.io-client'
export const socket = io(API_ORIGIN)

// In components:
socket.on('notification', (data) => {
  // Show toast + update notification badge
})
```

### Real-time Events

| Event | Direction | Description |
|---|---|---|
| `join` | Client → Server | User joins their personal room |
| `notification` | Server → Client | New notification pushed to user |
| `ticket:updated` | Server → Client | Ticket change broadcasted to project members |
| `connect` | Client → Server | Socket connected (logged in ConnectionLog) |
| `disconnect` | Client → Server | Socket disconnected (session duration recorded) |

---

## 16. Modules & Features

### 16.1 Ticket Management

The ticket system is modelled after Jira with these capabilities:

- **7 ticket types:** Epic, Story, Task, Bug, Subtask, Improvement, New Feature
- **7 statuses:** Backlog → To Do → In Progress → In Review → Testing → Done → Closed
- **5 priorities:** Lowest, Low, Medium, High, Highest
- **5 severities:** Trivial, Minor, Major, Critical, Blocker
- **Kanban board** view with drag-and-drop status updates
- **Subtask hierarchy** via `parentId` self-reference
- **Epic grouping** via `epicId` self-reference
- **Watchers** (JSON array of user IDs)
- **Labels & Components** (JSON arrays)
- **Attachments** (up to 10MB per file via Multer)
- **Comments** with file attachments
- **Time tracking** (original estimate, remaining, spent)
- **Story points** for sprint planning
- **Full audit trail** via TicketHistory
- **Ticket links** (blocks, is blocked by, relates to, duplicates)
- **Flag as urgent** toggle
- **Auto-generated ticket key** (e.g., `PROJ-042`)

### 16.2 Sprint Management

- Sprints belong to a project
- Status lifecycle: Future → Active → Closed
- Only one Active sprint per project at a time
- Velocity tracking via `completedPoints`
- Burndown chart data available via analytics API
- Tickets can be moved between sprints

### 16.3 Analytics

#### Organization Dashboard
- Total tickets by status across all accessible projects
- Open/closed ticket ratio
- Team workload distribution
- Recent activity feed

#### Project Analytics
- Status breakdown (pie chart)
- Priority distribution
- Sprint velocity chart
- Team member contribution
- Epic progress tracking
- Overdue tickets

#### Sprint Analytics
- Burndown chart (remaining story points over time)
- Velocity comparison across sprints
- Story point completion rate

#### RC/DC Analytics
- User connection/disconnection frequency
- Session duration distribution
- Command status breakdown (COMPLETED, COMINPROG, etc.)
- Timeline view of events

### 16.4 Billing Operations

#### Meter Readings
- Store `TOTAL_ENERGY`, `TOD1_ENERGY`, `TOD2_ENERGY` per meter per date
- Bulk import via CSV/Excel upload
- Estimation flag for gap-filling

#### Meter Estimation
- Algorithm fills in missing readings
- `estimationService.js` calculates interpolated values
- Estimated readings are marked with `is_estimated: true`

#### Bill Stop
- Query bill stop records from SQLite local store
- Snapshot saves from external SQL Server (`OTBL_CMS` database)
- Bill stop report with filters by date, customer, status

#### Meter Replacement
- Track old/new meter swaps with technician and date
- Linked to customer records

#### Daily Billing Reports & Batch Reports
- Aggregated daily billing summaries
- Batch processing status reports

### 16.5 Customer Management

- Customer database with 15+ fields
- Search and filter by customer number, meter, status
- Integration with complaint and billing modules

### 16.6 Complaint Management

- Complaint lifecycle: Open → In Progress → Close
- 4 priority levels with visual indicators
- Category-based organization
- Agent assignment with workload visibility
- Resolution tracking
- Reports and analytics

### 16.7 Content Management

Three content types managed via CKEditor 5:
1. **Announcements** — Company-wide notices
2. **SOPs** — Standard Operating Procedures
3. **Documents** — General project documents

### 16.8 Telegram Integration

Two modes (controlled by `TELEGRAM_MODE` env var):

**Polling Mode** — Bot polls Telegram servers (development/simple setup)  
**Webhook Mode** — Telegram pushes to `/api/telegram/webhook` (production)

Capabilities:
- Receive PDF and CSV files from Telegram
- Parse billing PDFs, import CSV data
- Query customer information via chat commands
- Send notification messages to configured group chats
- Per-user notification category settings

### 16.9 Connection Logging (RC/DC)

Every Socket.IO connect/disconnect event is logged:
- User ID, timestamp, IP address, user agent
- Event type: Connect, Reconnect, Disconnect
- Command status for operational tracking
- Session duration calculated on disconnect
- Analytics dashboard for operational visibility

### 16.10 Data Import/Export

**Import formats:** CSV, Excel (.xlsx), PDF  
**Export formats:** PDF (pdfkit/jsPDF), Excel (xlsx), JSON

Export capabilities:
- Ticket lists with all metadata
- Analytics reports
- Billing data
- Customer records

---

## 17. External Integrations

### Telegram Bot API
- **Library:** `node-telegram-bot-api`
- **Config:** `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`
- **Features:** File upload processing, customer queries, group notifications
- **Setup guide:** `TELEGRAM_BOT_SETUP.md`

### Groq AI API
- **Config:** `GROQ_API_KEY`
- **Service:** `aiService.js`
- **Usage:** AI-powered analysis features

### SQL Server (External OTBL_CMS Database)
- **Library:** `mssql`
- **Config:** `OTBL_CMS_DB_*` environment variables
- **Purpose:** Read bill stop snapshots from the external billing system
- **Usage:** One-way read (no writes to SQL Server)

### CMO External API
- **Config:** `CMO_API_URL`, `CMO_API_USERNAME`, `CMO_API_PASSWORD`
- **Purpose:** Fetch operational data from the CMO system
- **Rate limiting:** Serialized concurrent login attempts (prevents lockout)

---

## 18. Deployment

### Development

```bash
# Backend
cd backend
npm install
npm run dev         # nodemon src/app.js

# Frontend
cd frontend
npm install
npm run dev         # Vite dev server (hot reload)
```

### Production

**Backend (PM2):**
```bash
cd backend
npm install --production
npx sequelize-cli db:migrate
pm2 start ecosystem.config.js
pm2 save
```

**Frontend:**
```bash
cd frontend
npm run build       # Outputs to dist/
# Serve dist/ via Nginx or similar
```

**Using the update script:**
```bash
bash prod-update.sh   # Pulls, migrates, builds, restarts PM2, reloads Nginx
```

### Database Migrations

```bash
bash migrate.sh
# Or directly:
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all    # (optional) seed initial data
```

### PM2 Configuration (`ecosystem.config.js`)

```js
module.exports = {
  apps: [{
    name: 'otbl-cms',
    script: 'src/app.js',
    cwd: './backend',
    env: { NODE_ENV: 'development' },
    env_production: { NODE_ENV: 'production' }
  }]
}
```

### Production Nginx (Frontend)

```nginx
server {
    listen 80;
    root /path/to/cms-main/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /socket.io/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

---

## 19. Known Limitations

| Area | Limitation |
|---|---|
| **Testing** | No automated tests (no Jest, Vitest, or Mocha setup) |
| **API Docs** | No Swagger/OpenAPI specification |
| **Rate Limiting** | No request rate limiting on API endpoints |
| **Caching** | No Redis or in-memory cache layer |
| **Email** | No email notification system (Telegram only) |
| **TypeScript (BE)** | Backend uses CommonJS JavaScript, not TypeScript |
| **CI/CD** | No GitHub Actions workflows configured |
| **Database Scale** | SQLite not ideal for high-concurrency production workloads |
| **Frontend Store** | Pinia store is minimal — only auth and counter stores exist |
| **Password Reset** | No self-service password reset flow |

---

*Documentation generated for OTBL CMS V3 — April 2026*
