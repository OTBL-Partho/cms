# AMI Roaster Schedule - Implementation Guide

This guide provides everything you need to replicate the **AMI Roaster Schedule** feature in another project.

---

## 🏗️ 1. Project Structure
To implement this feature, you will need the following files in your project:

```text
frontend/
├── src/
│   ├── assets/
│   │   └── roaster.json            <-- The data file (generated from Excel)
│   ├── views/
│   │   └── AmiRoasterScheduleView.vue <-- The main UI component
│   └── router/
│       └── index.ts                <-- The route definition
RoasterList.xlsx                    <-- Source Excel file (at project root)
```

---

## 📖 2. How it Works
The AMI Roaster Schedule is a client-side feature designed to display and filter workforce monitoring duties.

### **Core Logic:**
*   **Data Source:** It uses a static JSON file (`roaster.json`) as its database. This ensures extremely fast loading times and zero backend dependency.
*   **Filtering:** The UI provides three real-time filters (Name, Date, Weekday) that work together to narrow down results.
*   **Smart Highlighting:**
    *   **Today:** The current day's row is highlighted with a blue border and a pulsing "Today" badge.
    *   **Auto-Scroll:** When the page loads, it automatically scrolls to the "Today" row for immediate visibility.
    *   **Past Duties:** Completed dates are automatically dimmed (reduced opacity) to focus attention on current and upcoming tasks.
*   **Responsive Design:** The table and filters are fully responsive, adapting from large desktop screens to mobile devices.

---

## 🔄 3. Updating the Schedule (Excel to JSON)
When a new schedule is released in Excel format, follow these steps to update the application:

### **Step 1: Prepare the Excel File**
Ensure your `RoasterList.xlsx` file is in the project root and contains the following columns in the first sheet:
*   **Date**: The date of the shift.
*   **DayH**: The weekday name (e.g., "Monday").
*   **Name**: The name of the person on duty.

### **Step 2: Run the Conversion Script**
Run this command from the project root to convert the Excel data into the required JSON format for the frontend:

```powershell
node -e "const XLSX = require('./backend/node_modules/xlsx'); const fs = require('fs'); try { const workbook = XLSX.readFile('RoasterList.xlsx'); const sheet = workbook.Sheets[workbook.SheetNames[0]]; const data = XLSX.utils.sheet_to_json(sheet); const formattedData = data.map(row => { let date = row.Date; if (typeof date === 'number') { date = new Date(Math.round((date - 25569) * 86400 * 1000)).toISOString().split('T')[0]; } return { date, day: row.DayH, name: row.Name }; }); fs.writeFileSync('frontend/src/assets/roaster.json', JSON.stringify(formattedData, null, 2)); console.log('Successfully updated roaster.json from Excel!'); } catch (err) { console.error('Error:', err.message); }"
```

### **Step 3: Verify the Update**
Simply refresh the browser. The frontend will automatically pick up the new data from `src/assets/roaster.json`.

---

## 🖥️ 4. The UI Component (`AmiRoasterScheduleView.vue`)
The component uses Vue 3 Composition API and standard CSS. 

*See the source code in `frontend/src/views/AmiRoasterScheduleView.vue` for the full implementation.*

---

## 🛤️ 5. Routing Configuration
Add the following to your `frontend/src/router/index.ts`:

```typescript
{
  path: '/roaster-schedule',
  name: 'roaster-schedule',
  component: () => import('../views/AmiRoasterScheduleView.vue'),
  meta: { requiresAuth: true }
}
```

---

## 🎨 6. Sidebar Integration
To add the link between Dashboard and Tickets, modify your sidebar layout:

```html
<router-link to="/dashboard">Dashboard</router-link>
<router-link to="/roaster-schedule">📅 AMI Roaster Schedule</router-link>
<router-link to="/tickets">Tickets</router-link>
```
