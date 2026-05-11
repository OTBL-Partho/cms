# AMI Roaster Schedule — Technical Guide

## Overview

The `/roaster-schedule` tab manages duty roster assignments for the AMI monitoring team. Data is stored in SQLite via Sequelize and served through a REST API. All changes (upload or edit) are immediately visible to all users.

---

## Database

**Table:** `RoasterSchedules`

| Column | Type | Nullable | Notes |
|--------|------|----------|-------|
| `id` | INTEGER PK | No | Auto-increment |
| `date` | DATEONLY | No | `YYYY-MM-DD` format |
| `day` | STRING | Yes | Full day name (e.g. `Wednesday`) |
| `name` | STRING | No | Duty member name |
| `email` | STRING | Yes | Optional |
| `assignment` | STRING | Yes | Multi-line task text; null = no custom task |

**Migrations:** Two migration files under `backend/src/migrations/` — one creates the table, one adds the `assignment` column.

Run on server after deployment:
```bash
cd backend && npx sequelize-cli db:migrate
```

---

## Backend API

**Base path:** `/api/roaster`  
**Auth:** All routes require valid JWT (`protect` middleware)

### `GET /api/roaster`
- **Access:** All authenticated users
- **Returns:** All rows ordered by `date ASC`
- **Response:**
```json
{
  "success": true,
  "data": [
    {
      "date": "2026-04-01",
      "day": "Wednesday",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "assignment": "🔧 MAINTENANCE BATCH"
    }
  ]
}
```

### `POST /api/roaster`
- **Access:** `Admin`, `Super Admin` only
- **Behavior:** Replaces the entire schedule atomically in a single transaction
- **Body:**
```json
{
  "entries": [
    {
      "date": "2026-04-01",
      "day": "Wednesday",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "assignment": "🔧 MAINTENANCE BATCH"
    }
  ]
}
```
- **Response:** `{ "success": true, "saved": 30 }`

---

## Frontend

**File:** `frontend/src/views/AmiRoasterScheduleView.vue`  
**API functions:** `frontend/src/api.ts` → `getRoasterSchedule()`, `saveRoasterSchedule(entries)`

### Access Control

| Action | Allowed Roles |
|--------|--------------|
| View page (list + calendar) | All authenticated |
| Upload schedule | Admin, Super Admin |
| Edit a row | Admin, Super Admin |
| Edit a completed (past-date) row | Nobody — button disabled |

---

## Page Load Flow

```
onMounted
  → fetchRoaster()  →  GET /api/roaster  →  roaster.value = response.data
  → await nextTick()
  → scrollIntoView('.is-today', { behavior: 'smooth', block: 'center' })
```

---

## Upload Schedule Flow

1. Admin clicks **Upload Schedule** button (header, top-right)
2. File picker opens — accepts `.xlsx`, `.xls`, `.csv`
3. File parsed client-side with `XLSX.js`:
   - Columns read: `Date`, `DayH`, `Name`, `Email` (Email optional)
   - `Date` values parsed via `XLSX.SSF.parse_date_code()` — handles raw Excel serial numbers, completely timezone-independent
   - For each date, existing `assignment` value from current DB is preserved if present
   - Rows missing `date` or `name` are silently skipped
   - Result sorted by date ascending
4. **Preview modal** shown — table of all parsed rows (`#`, Date, Day, Name, Email, Assignment)
5. Admin clicks **Upload** in modal → `POST /api/roaster` → schedule replaced in DB
6. `roaster.value` updated immediately; success/error banner shown for 4 seconds

### Excel File Format

| Column | Required | Notes |
|--------|----------|-------|
| `Date` | Yes | Excel date or `YYYY-MM-DD` string |
| `DayH` | Yes | Full day name: `Monday`, `Tuesday`, etc. |
| `Name` | Yes | Duty member name |
| `Email` | No | Ignored if absent |

> No `Assignment` column needed in the file. Assignments are set manually via the edit modal.

### Date Parsing (Timezone-Safe)

Excel stores dates as serial integers (e.g. `46113` = 1 April 2026).  
Using `XLSX.SSF.parse_date_code(serial)` returns `{y, m, d}` directly — no UTC conversion, no timezone shift.

```ts
const toLocalISO = (val: any): string => {
  if (typeof val === 'number') {
    const p = (XLSX.SSF as any).parse_date_code(val);
    if (p) return `${p.y}-${String(p.m).padStart(2,'0')}-${String(p.d).padStart(2,'0')}`;
  }
  const s = String(val).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  return '';
};
```

---

## Edit Row Flow

1. Admin clicks pencil icon on any non-completed row
2. **Edit modal** opens pre-filled with: Date, Day, Name, Email, Assignment
3. Assignment field is a **resizable textarea** — supports multiple lines (one task per line)
4. Admin clicks **Save** → updated list saved to server → modal closes

> Edit button is **disabled** for rows where `date < today` (status = Completed).

---

## Assignments Column

Displayed in the list table after the Status column.

| Condition | Displayed Value |
|-----------|----------------|
| `item.assignment` has text | Stored text (rendered with line breaks) |
| `assignment` is null AND day is `Sunday` or `Wednesday` | `🔧 MAINTENANCE BATCH` |
| `assignment` is null AND any other day | `—` |

> `🔧 MAINTENANCE BATCH` is a **display-only default** — it is never auto-written to the database. Only values explicitly saved via the edit modal are stored.

---

## Template Structure

```
<roaster-container>
  ├── <header>
  │     ├── Icon + Title ("AMI Roaster Schedule") + subtitle
  │     ├── Stats bar: Total Entries | Completed | Remaining
  │     └── [Upload Schedule button]  ← Admin/Super Admin only
  │
  ├── <filter-glass>  (client-side, no API call)
  │     └── Duty Member (dropdown) | Specific Date | Day of Week | Clear Filters
  │
  ├── <schedule-card>  (List view)
  │     └── <table>
  │           ├── Headers: Date Information | Duty Member | Status | Assignments | (edit col)
  │           └── Per row:
  │                 ├── Calendar icon + full date string + weekday label
  │                 ├── Colour-coded avatar + member name
  │                 ├── Status badge: "Active Now" / "Completed" / "Scheduled"
  │                 ├── Assignment chip (pre-wrap, orange) or em-dash
  │                 └── Pencil edit button (hidden if !canEdit, disabled if Completed)
  │
  ├── <calendar-section>  (Calendar view)
  │     ├── Month navigation (prev/next)
  │     └── 7-column grid — duty chip shown on days with entries
  │
  ├── <edit-modal>
  │     └── Fields: Date, Day (select), Name, Email, Assignment (textarea, resizable)
  │
  ├── <preview-modal>
  │     └── Scrollable table of parsed file rows before confirming upload
  │
  └── <floating-bar>  (fixed bottom-center)
        └── List view | Calendar view | Dark/Light theme toggle
```

---

## Row Status Logic

| Condition | Status | CSS class | Behaviour |
|-----------|--------|-----------|-----------|
| `date === today` | Active Now | `.is-today` | Highlighted row, pulse badge, scroll-to on load |
| `date < today` | Completed | `.is-past` | 45% opacity, strikethrough text, edit disabled |
| `date > today` | Scheduled | — | Normal |

---

## Per-Member Colour Coding

Rows and avatars use per-member colour palettes (dark + light mode variants). Member names are matched against a predefined palette map; unknown names fall back to a neutral grey.

---

## Deployment Checklist

After pushing backend changes to production:

```bash
# 1. Pull latest code
git pull origin main

# 2. Run migrations (safe to re-run — skips already-applied)
cd backend && npx sequelize-cli db:migrate

# 3. Rebuild frontend (if frontend changed)
cd ../frontend && npm run build

# 4. Restart backend process
```

After first-ever deployment, upload the roster Excel file via the UI to populate the database.

---

## Files Reference

| File | Purpose |
|------|---------|
| `frontend/src/views/AmiRoasterScheduleView.vue` | Main page component |
| `frontend/src/api.ts` | `getRoasterSchedule()`, `saveRoasterSchedule()` |
| `backend/src/controllers/roasterController.js` | `getRoaster`, `saveRoaster` handlers |
| `backend/src/models/RoasterSchedule.js` | Sequelize model |
| `backend/src/routes/roaster.js` | Express router |
| `backend/src/migrations/` | Table creation + assignment column migrations |
