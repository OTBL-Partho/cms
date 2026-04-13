# AMI Roaster Schedule - Operational Guide

This document tracks the implementation and maintenance of the **AMI Roaster Schedule** page.

## 📋 Overview
The AMI Roaster Schedule is a dedicated page for monitoring duty assignments. It is located in the sidebar between the **Dashboard** and **Tickets** tabs.

## 💾 Data Management
The schedule data is sourced from an Excel file but served as a JSON asset for high performance and zero database impact.

*   **Source File:** `RoasterList.xlsx` (Root Directory)
*   **Processed Data:** `frontend/src/assets/roaster.json`

### How to Update the Schedule
If you need to change or extend the schedule, follow these steps:

1.  Replace the `RoasterList.xlsx` file in the root directory with your new file.
2.  Ensure the Excel file has these column headers: `Date`, `DayH`, and `Name`.
3.  Run the following command in your terminal from the project root:

```powershell
cd frontend
node -e "const XLSX = require('xlsx'); const fs = require('fs'); const workbook = XLSX.readFile('../RoasterList.xlsx'); const sheetName = workbook.SheetNames[0]; const sheet = workbook.Sheets[sheetName]; const data = XLSX.utils.sheet_to_json(sheet); const formattedData = data.map(row => { let date = row.Date; if (typeof date === 'number') { date = new Date(Math.round((date - 25569) * 86400 * 1000)).toISOString().split('T')[0]; } return { date, day: row.DayH, name: row.Name }; }); fs.writeFileSync('src/assets/roaster.json', JSON.stringify(formattedData, null, 2));"
```

## ⚡ Dynamic Features
The page is fully dynamic and updates itself based on the current system date:

*   **Today's Highlight:** The row for the current date is highlighted in light blue with a "Today" badge and a pulse effect.
*   **Automatic Strikethrough:** Any monitoring duty that has passed (date < today) automatically receives a strikethrough effect and reduced opacity.
*   **Auto-Scroll:** Upon loading the page, it automatically scrolls to the "Today" row for immediate visibility.
*   **Smart Filtering:** 
    *   **Filter by Name:** Dropdown list of all unique members found in the schedule.
    *   **Filter by Date:** Specific date selector.
    *   **Filter by Weekday:** Dropdown to view all duties on specific days (e.g., all Fridays).

## 🛠️ Technical Implementation
*   **View Component:** `frontend/src/views/AmiRoasterScheduleView.vue`
*   **Route:** `/roaster-schedule` (Defined in `frontend/src/router/index.ts`)
*   **Layout:** Integrated into `frontend/src/layouts/MainLayout.vue` sidebar.

---
*Last Updated: April 8, 2026*
