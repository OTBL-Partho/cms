<template>
  <div class="roaster-container" :class="{ 'dark-mode': isDark }">

    <!-- ── Header ─────────────────────────────────────────────── -->
    <header class="schedule-header animate-slide-down">
      <div class="header-main">
        <div class="icon-box">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z" />
          </svg>
        </div>
        <div class="title-group">
          <h1 class="title-h1">AMI Roaster Schedule</h1>
          <p class="title-sub">Real-time monitoring duty assignments and tracking</p>
        </div>
      </div>
      <div class="header-right">
        <div class="header-stats">
          <div class="stat-item">
            <span class="stat-label">Total Entries</span>
            <span class="stat-value">{{ roaster.length }}</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <span class="stat-label">Completed</span>
            <span class="stat-value highlight">{{ completedCount }}</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <span class="stat-label">Remaining</span>
            <span class="stat-value">{{ roaster.length - completedCount }}</span>
          </div>
        </div>

        <label class="btn-upload" :class="{ uploading: uploadParsing }" title="Upload new schedule (CSV or Excel)">
          <svg v-if="!uploadParsing" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
          </svg>
          <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="spin">
            <circle cx="12" cy="12" r="10" stroke-dasharray="31.4" stroke-dashoffset="10" />
          </svg>
          {{ uploadParsing ? 'Parsing...' : 'Upload Schedule' }}
          <input type="file" accept=".csv,.xlsx,.xls" @change="handleUpload" style="display:none" />
        </label>

        <div v-if="uploadMsg" class="upload-msg" :class="uploadMsg.type">
          {{ uploadMsg.text }}
        </div>
      </div>
    </header>

    <!-- ── Filters ─────────────────────────────────────────────── -->
    <section class="filter-glass animate-fade-in">
      <div class="filter-row">
        <div class="input-wrapper">
          <label>Duty Member</label>
          <div class="select-wrap">
            <select v-model="filters.name" class="input-field">
              <option value="">All Members</option>
              <option v-for="name in uniqueNames" :key="name" :value="name">{{ name }}</option>
            </select>
          </div>
        </div>
        <div class="input-wrapper">
          <label>Specific Date</label>
          <input type="date" v-model="filters.date" class="input-field" />
        </div>
        <div class="input-wrapper">
          <label>Day of Week</label>
          <div class="select-wrap">
            <select v-model="filters.day" class="input-field">
              <option value="">Every Day</option>
              <option v-for="day in weekDays" :key="day" :value="day">{{ day }}</option>
            </select>
          </div>
        </div>
        <div class="actions">
          <button class="btn-reset" @click="resetFilters" :disabled="!isFiltered">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
            </svg>
            Clear Filters
          </button>
        </div>
      </div>
    </section>

    <!-- ── List View ───────────────────────────────────────────── -->
    <main v-if="viewMode === 'list'" class="schedule-card animate-fade-in-up">
      <div class="table-responsive">
        <table class="schedule-table">
          <thead>
            <tr>
              <th>Date Information</th>
              <th>Duty Member</th>
              <th>Status</th>
              <th>Assignments</th>
              <th v-if="canEdit"></th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(item, index) in filteredRoaster"
              :key="index"
              class="schedule-row"
              :class="{ 'is-today': isToday(item.date), 'is-past': isPast(item.date) }"
              :style="getRowStyle(item)"
            >
              <td>
                <div class="date-block">
                  <div class="calendar-icon" :class="getDayClass(item.day)">
                    <span class="month-short">{{ getMonthShort(item.date) }}</span>
                    <span class="day-num">{{ getDayNum(item.date) }}</span>
                  </div>
                  <div class="date-text">
                    <span class="full-date">{{ formatDate(item.date) }}</span>
                    <span class="weekday-label">{{ item.day }}</span>
                  </div>
                </div>
              </td>
              <td>
                <div class="member-info">
                  <div class="avatar-mini" :style="getAvatarStyle(item.name)">
                    {{ item.name.charAt(0) }}
                  </div>
                  <span class="member-name">{{ item.name }}</span>
                </div>
              </td>
              <td>
                <span v-if="isToday(item.date)" class="badge badge-today">
                  <span class="pulse-dot"></span> Active Now
                </span>
                <span v-else-if="isPast(item.date)" class="badge badge-past">Completed</span>
                <span v-else class="badge badge-upcoming">Scheduled</span>
              </td>
              <td class="td-assignment">
                <span v-if="item.assignment || item.day === 'Sunday' || item.day === 'Wednesday'" class="assignment-chip">
                  {{ item.assignment || '🔧 MAINTENANCE BATCH' }}
                </span>
                <span v-else class="assignment-empty">—</span>
              </td>
              <td v-if="canEdit" class="td-action">
                <button class="btn-edit-row" @click="startEdit(item)" :title="isPast(item.date) ? 'Cannot edit completed entries' : 'Edit row'" :disabled="isPast(item.date)">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </button>
              </td>
            </tr>

            <tr v-if="filteredRoaster.length === 0">
              <td :colspan="canEdit ? 5 : 4" class="empty-state">
                <div class="empty-msg">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke-width="1.5">
                    <circle cx="12" cy="12" r="10" :stroke="isDark ? '#334155' : '#cbd5e1'" />
                    <path d="M8 12h8" :stroke="isDark ? '#334155' : '#cbd5e1'" />
                  </svg>
                  <p>No duty matches your current filter</p>
                  <button @click="resetFilters" class="text-btn">Reset all filters</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>

    <!-- ── Calendar View ──────────────────────────────────────── -->
    <div v-else class="calendar-section animate-fade-in-up">
      <div class="cal-nav-bar">
        <button class="cal-nav-btn" @click="prevMonth">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <span class="cal-month-label">{{ calMonthLabel }}</span>
        <button class="cal-nav-btn" @click="nextMonth">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>

      <div class="calendar-grid">
        <!-- Day-of-week headers -->
        <div
          v-for="dow in daysOfWeek"
          :key="'dow-' + dow"
          class="cal-dow"
          :class="{ 'cal-dow-weekend': dow === 'Fri' || dow === 'Sat' }"
        >
          {{ dow }}
        </div>

        <!-- Day cells -->
        <div
          v-for="(cell, i) in calendarDays"
          :key="'cell-' + i"
          class="cal-day"
          :class="{
            'other-month':    !cell.current,
            'is-today-cal':    cell.isToday,
            'has-duty':       !!cell.duty,
            'cal-dimmed':      !!isFiltered && cell.current && !calDayMatches(cell),
            'cal-highlighted': !!isFiltered && cell.current &&  calDayMatches(cell)
          }"
        >
          <span class="cal-date-num" :class="{ 'cal-date-today': cell.isToday }">
            {{ cell.num }}
          </span>
          <div v-if="cell.duty" class="cal-duty-chip" :style="getChipStyle(cell.duty.name)">
            <span class="chip-dot" :style="{ background: getDotColor(cell.duty.name) }"></span>
            <span>{{ cell.duty.name }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Edit Modal ────────────────────────────────────────── -->
    <div v-if="editRow" class="modal-backdrop" @click.self="editRow = null">
      <div class="modal-box" :class="{ 'dark-mode': isDark }">
        <div class="modal-header">
          <h3 class="modal-title">Edit Schedule Entry</h3>
          <button class="modal-close" @click="editRow = null">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Date</label>
            <input type="date" v-model="editForm.date" class="modal-input" />
          </div>
          <div class="form-group">
            <label>Day</label>
            <div class="select-wrap">
              <select v-model="editForm.day" class="modal-input">
                <option value="">— select —</option>
                <option v-for="d in weekDays" :key="d" :value="d">{{ d }}</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label>Name</label>
            <input type="text" v-model="editForm.name" class="modal-input" placeholder="Full name" />
          </div>
          <div class="form-group">
            <label>Email</label>
            <input type="email" v-model="editForm.email" class="modal-input" placeholder="email@example.com" />
          </div>
          <div class="form-group">
            <label>Assignment</label>
            <input type="text" v-model="editForm.assignment" class="modal-input" placeholder="e.g. 🔧 MAINTENANCE BATCH" />
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="editRow = null">Cancel</button>
          <button class="btn-save" @click="saveEdit">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2zM17 21v-8H7v8M7 3v5h8" />
            </svg>
            Save
          </button>
        </div>
      </div>
    </div>

    <!-- ── Upload Preview Modal ─────────────────────────────── -->
    <div v-if="showPreviewModal" class="modal-backdrop" @click.self="showPreviewModal = false">
      <div class="modal-box preview-modal" :class="{ 'dark-mode': isDark }">
        <div class="modal-header">
          <div>
            <h3 class="modal-title">Preview Schedule</h3>
            <p class="preview-subtitle">{{ previewData.length }} entries — review before uploading</p>
          </div>
          <button class="modal-close" @click="showPreviewModal = false">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="preview-table-wrap">
          <table class="preview-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Date</th>
                <th>Day</th>
                <th>Name</th>
                <th>Email</th>
                <th>Assignment</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, i) in previewData" :key="i">
                <td class="preview-num">{{ i + 1 }}</td>
                <td>{{ row.date }}</td>
                <td>{{ row.day }}</td>
                <td class="preview-name">{{ row.name }}</td>
                <td class="preview-email">{{ row.email || '—' }}</td>
                <td class="preview-assignment">{{ row.assignment || '—' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="showPreviewModal = false">Cancel</button>
          <button class="btn-save" @click="confirmUpload" :disabled="uploadParsing">
            <svg v-if="uploadParsing" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="spin">
              <circle cx="12" cy="12" r="10" stroke-dasharray="31.4" stroke-dashoffset="10" />
            </svg>
            <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
            </svg>
            {{ uploadParsing ? 'Uploading...' : 'Upload' }}
          </button>
        </div>
      </div>
    </div>

    <!-- ── Floating Controls Bar ──────────────────────────────── -->
    <div class="floating-bar">
      <button
        class="view-pill"
        :class="{ active: viewMode === 'list' }"
        @click="viewMode = 'list'"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
        </svg>
        List
      </button>
      <button
        class="view-pill"
        :class="{ active: viewMode === 'calendar' }"
        @click="viewMode = 'calendar'"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z" />
        </svg>
        Calendar
      </button>
      <div class="bar-divider"></div>
      <button class="theme-pill" @click="toggleTheme" :title="isDark ? 'Switch to Light' : 'Switch to Dark'">
        <!-- Sun icon — shown in dark mode -->
        <svg v-if="isDark" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <circle cx="12" cy="12" r="5" />
          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
        </svg>
        <!-- Moon icon — shown in light mode -->
        <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
        </svg>
        {{ isDark ? 'Light' : 'Dark' }}
      </button>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue';
import * as XLSX from 'xlsx';
import { getRoasterSchedule, saveRoasterSchedule } from '../api';
import { useAuthStore } from '../stores/auth';

interface RoasterItem {
  date: string;
  day: string;
  name: string;
  email?: string;
  assignment?: string | null;
}

interface MemberColor {
  bg: string;
  border: string;
  text: string;
}

// ── Per-member color palettes ────────────────────────────────────
const memberColors: Record<string, MemberColor> = {
  Mominul: { bg: 'rgba(255,193,7,0.22)',  border: '#ffc107', text: '#ffe066' },
  Lira:    { bg: 'rgba(255,45,120,0.22)', border: '#ff2d78', text: '#ff80ab' },
  Topu:    { bg: 'rgba(0,229,255,0.18)',  border: '#00e5ff', text: '#80f4ff' },
  Poly:    { bg: 'rgba(179,0,255,0.2)',   border: '#b300ff', text: '#df80ff' },
  Kaniz:   { bg: 'rgba(0,230,118,0.18)', border: '#00e676', text: '#69ffa9' },
  Toma:    { bg: 'rgba(255,109,0,0.22)', border: '#ff6d00', text: '#ffab40' },
  Bithi:   { bg: 'rgba(41,182,246,0.2)', border: '#29b6f6', text: '#80d8ff' },
  Partho:  { bg: 'rgba(255,23,68,0.2)',  border: '#ff1744', text: '#ff80ab' },
};
const defaultColor: MemberColor = { bg: 'rgba(100,116,139,0.18)', border: '#64748b', text: '#94a3b8' };

const memberColorsLight: Record<string, MemberColor> = {
  Mominul: { bg: 'rgba(217,119,6,0.14)',  border: '#d97706', text: '#92400e' },
  Lira:    { bg: 'rgba(219,39,119,0.12)', border: '#db2777', text: '#9d174d' },
  Topu:    { bg: 'rgba(8,145,178,0.13)',  border: '#0891b2', text: '#0e7490' },
  Poly:    { bg: 'rgba(124,58,237,0.12)', border: '#7c3aed', text: '#5b21b6' },
  Kaniz:   { bg: 'rgba(5,150,105,0.13)', border: '#059669', text: '#065f46' },
  Toma:    { bg: 'rgba(234,88,12,0.13)', border: '#ea580c', text: '#9a3412' },
  Bithi:   { bg: 'rgba(37,99,235,0.12)', border: '#2563eb', text: '#1e40af' },
  Partho:  { bg: 'rgba(225,29,72,0.12)', border: '#e11d48', text: '#9f1239' },
};
const defaultColorLight: MemberColor = { bg: 'rgba(100,116,139,0.1)', border: '#94a3b8', text: '#475569' };

// ── Static data ──────────────────────────────────────────────────
const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// ── State ────────────────────────────────────────────────────────
const savedTheme = localStorage.getItem('roaster-theme');
const isDark = ref<boolean>(savedTheme ? savedTheme === 'dark' : true);
const viewMode = ref<'list' | 'calendar'>('list');
const calYear  = ref(new Date().getFullYear());
const calMonth = ref(new Date().getMonth());   // 0-indexed

const roaster  = ref<RoasterItem[]>([]);
const roasterLoading = ref(false);

const fetchRoaster = async () => {
  roasterLoading.value = true;
  try {
    const res = await getRoasterSchedule();
    roaster.value = res.data.data || [];
  } catch (err) {
    console.error('Failed to fetch roaster:', err);
  } finally {
    roasterLoading.value = false;
  }
};
const filters  = ref({ name: '', date: '', day: '' });

const auth = useAuthStore();
const canEdit = computed(() => auth.isSuperAdmin || auth.isAdmin);

const uploadParsing = ref(false);
const uploadMsg = ref<{ type: 'success' | 'error'; text: string } | null>(null);
const showPreviewModal = ref(false);
const previewData = ref<RoasterItem[]>([]);

// Edit modal state
const editRow = ref<{ item: RoasterItem; index: number } | null>(null);
const editForm = ref({ date: '', day: '', name: '', email: '', assignment: '' });

const startEdit = (item: RoasterItem) => {
  const idx = roaster.value.indexOf(item);
  editRow.value = { item, index: idx };
  editForm.value = { date: item.date, day: item.day, name: item.name, email: item.email || '', assignment: item.assignment || '' };
};

const saveEdit = async () => {
  if (!editRow.value) return;
  const updated: RoasterItem = {
    date:       editForm.value.date.trim(),
    day:        editForm.value.day.trim(),
    name:       editForm.value.name.trim(),
    email:      editForm.value.email.trim() || undefined,
    assignment: editForm.value.assignment.trim() || null,
  };
  const newList = [...roaster.value];
  newList[editRow.value.index] = updated;
  newList.sort((a, b) => a.date.localeCompare(b.date));
  try {
    await saveRoasterSchedule(newList);
    roaster.value = newList;
    editRow.value = null;
  } catch (err) {
    console.error('Failed to save edit:', err);
    alert('Failed to save. Please try again.');
  }
};

const handleUpload = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  input.value = '';
  if (!file) return;

  uploadMsg.value = null;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const wb = XLSX.read(data, { type: 'array' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows: any[] = XLSX.utils.sheet_to_json(ws, { raw: true });

      const toLocalISO = (val: any): string => {
        if (!val) return '';
        if (typeof val === 'number') {
          const p = (XLSX.SSF as any).parse_date_code(val);
          if (p) return `${p.y}-${String(p.m).padStart(2,'0')}-${String(p.d).padStart(2,'0')}`;
        }
        const s = String(val).trim();
        if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
        return '';
      };

      // Preserve any manually-set assignments for dates that still exist after upload
      const existingAssignments: Record<string, string | null> = {};
      for (const r of roaster.value) {
        existingAssignments[r.date] = r.assignment ?? null;
      }

      const parsed: RoasterItem[] = [];
      for (const row of rows) {
        const date  = toLocalISO(row['Date']);
        const day   = (row['DayH']  || '').toString().trim();
        const name  = (row['Name']  || '').toString().trim();
        const email = (row['Email'] || '').toString().trim();
        if (!date || !name) continue;
        parsed.push({ date, day, name, email: email || undefined, assignment: existingAssignments[date] ?? null });
      }

      if (parsed.length === 0) {
        uploadMsg.value = { type: 'error', text: 'No valid rows found. Check columns: Date, DayH, Name, Email.' };
        return;
      }

      parsed.sort((a, b) => a.date.localeCompare(b.date));
      previewData.value = parsed;
      showPreviewModal.value = true;
    } catch (err) {
      uploadMsg.value = { type: 'error', text: 'Failed to parse file.' };
    }
  };
  reader.readAsArrayBuffer(file);
};

const confirmUpload = async () => {
  uploadParsing.value = true;
  try {
    await saveRoasterSchedule(previewData.value);
    roaster.value = [...previewData.value];
    showPreviewModal.value = false;
    uploadMsg.value = { type: 'success', text: `${previewData.value.length} entries saved to server.` };
    setTimeout(() => { uploadMsg.value = null; }, 4000);
  } catch (err) {
    uploadMsg.value = { type: 'error', text: 'Failed to save. Please try again.' };
  } finally {
    uploadParsing.value = false;
  }
};

// ── Computed ─────────────────────────────────────────────────────
const uniqueNames = computed(() => {
  const names = new Set(roaster.value.map(i => i.name).filter(Boolean));
  return Array.from(names).sort();
});

const isFiltered = computed(() =>
  filters.value.name || filters.value.date || filters.value.day
);

const filteredRoaster = computed(() =>
  roaster.value
    .filter(item => {
      const matchName = !filters.value.name || item.name === filters.value.name;
      const matchDate = !filters.value.date || item.date === filters.value.date;
      const matchDay  = !filters.value.day  || item.day  === filters.value.day;
      return matchName && matchDate && matchDay;
    })
    .sort((a, b) => a.date.localeCompare(b.date))
);

const completedCount = computed(() => {
  const today = new Date().toISOString().split('T')[0];
  return roaster.value.filter(i => i.date < today).length;
});

const calMonthLabel = computed(() =>
  new Date(calYear.value, calMonth.value, 1)
    .toLocaleString('default', { month: 'long', year: 'numeric' })
);

const dutyMap = computed(() => {
  const map: Record<string, RoasterItem> = {};
  roaster.value.forEach(item => { map[item.date] = item; });
  return map;
});

const calendarDays = computed(() => {
  const yr       = calYear.value;
  const mo       = calMonth.value;
  const today    = new Date().toISOString().split('T')[0];
  const firstDow = new Date(yr, mo, 1).getDay();
  const lastDate = new Date(yr, mo + 1, 0).getDate();
  const days: { num: number; current: boolean; isToday: boolean; duty: RoasterItem | null; dateStr: string }[] = [];

  // Pad with prev-month days
  for (let i = 0; i < firstDow; i++) {
    const d = new Date(yr, mo, -(firstDow - i - 1));
    days.push({ num: d.getDate(), current: false, isToday: false, duty: null, dateStr: '' });
  }
  // Current month
  for (let d = 1; d <= lastDate; d++) {
    const dateStr = `${yr}-${String(mo + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    days.push({ num: d, current: true, isToday: dateStr === today, duty: dutyMap.value[dateStr] || null, dateStr });
  }
  // Pad to 42 cells
  const remaining = 42 - days.length;
  for (let i = 1; i <= remaining; i++) {
    days.push({ num: i, current: false, isToday: false, duty: null, dateStr: '' });
  }
  return days;
});

// ── Methods ──────────────────────────────────────────────────────
const isToday    = (dateStr: string) => dateStr === new Date().toISOString().split('T')[0];
const isPast     = (dateStr: string) => dateStr < new Date().toISOString().split('T')[0];
const getDayClass = (day: string)    => ['Friday', 'Saturday'].includes(day) ? 'weekend' : 'weekday';

const formatDate = (dateStr: string) => {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
};
const getMonthShort = (dateStr: string) => {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleString('default', { month: 'short' }).toUpperCase();
};
const getDayNum = (dateStr: string) => parseInt(dateStr.split('-')[2]);

const resetFilters = () => { filters.value = { name: '', date: '', day: '' }; };

// Returns true when a calendar cell satisfies every active filter.
// Only called for current-month cells (padding cells are excluded in the template).
const calDayMatches = (cell: { duty: RoasterItem | null; dateStr: string }): boolean => {
  const matchName = !filters.value.name || (!!cell.duty && cell.duty.name === filters.value.name);
  const matchDate = !filters.value.date || cell.dateStr === filters.value.date;
  const matchDay  = !filters.value.day  || (!!cell.duty && cell.duty.day  === filters.value.day);
  return matchName && matchDate && matchDay;
};

const prevMonth = () => {
  if (calMonth.value === 0) { calMonth.value = 11; calYear.value--; }
  else calMonth.value--;
};
const nextMonth = () => {
  if (calMonth.value === 11) { calMonth.value = 0; calYear.value++; }
  else calMonth.value++;
};

const getPalette  = () => isDark.value ? memberColors      : memberColorsLight;
const getFallback = () => isDark.value ? defaultColor      : defaultColorLight;

const getAvatarStyle = (name: string) => {
  const c = getPalette()[name] || getFallback();
  return { background: c.bg, border: `1.5px solid ${c.border}`, color: c.text };
};

const getRowStyle = (item: RoasterItem) => {
  if (isToday(item.date)) return {};
  const c = getPalette()[item.name] || getFallback();
  return { borderLeftColor: c.border };
};

const getChipStyle = (name: string) => {
  const c = getPalette()[name] || getFallback();
  return { background: c.bg, border: `1px solid ${c.border}`, color: c.text };
};

const getDotColor = (name: string) =>
  (getPalette()[name] || getFallback()).border;

const applyTheme = () => {
  localStorage.setItem('roaster-theme', isDark.value ? 'dark' : 'light');
};

const toggleTheme = () => {
  isDark.value = !isDark.value;
  applyTheme();
};

// ── Lifecycle ────────────────────────────────────────────────────
onMounted(async () => {
  applyTheme();
  await fetchRoaster();
  await nextTick();
  const todayRow = document.querySelector('.is-today');
  if (todayRow) todayRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

/* ═══════════════════════════════════════════════════════════════
   CONTAINER — breaks out of layout's padding + max-width
═══════════════════════════════════════════════════════════════ */
.roaster-container {
  font-family: 'Plus Jakarta Sans', sans-serif;

  /* ── Break out of .main-content's 2rem padding ── */
  margin: -2rem -2rem -2rem -2rem;

  /* ── Fill the viewport below the sticky navbar ── */
  min-height: calc(100vh - var(--navbar-height, 64px));

  /* ── Re-establish inner spacing so content doesn't hug the edge ── */
  padding: 2rem 2rem 8rem;

  background: linear-gradient(135deg, #eef2ff 0%, #fdf4ff 50%, #ecfeff 100%);
  transition: background 0.4s ease;
  box-sizing: border-box;
}
.dark-mode.roaster-container {
  background: linear-gradient(135deg, #1a0533 0%, #0d1b6e 35%, #0a3d6b 65%, #0d1b3e 100%);
}

/* Custom scrollbar */
.roaster-container ::-webkit-scrollbar       { width: 6px; height: 6px; }
.roaster-container ::-webkit-scrollbar-track { background: rgba(255,255,255,0.02); }
.roaster-container ::-webkit-scrollbar-thumb { background: linear-gradient(180deg, #f472b6, #a855f7); border-radius: 3px; }
.roaster-container ::-webkit-scrollbar-thumb:hover { background: linear-gradient(180deg, #fb7bb8, #c084fc); }

/* ═══════════════════════════════════════════════════════════════
   HEADER
═══════════════════════════════════════════════════════════════ */
.schedule-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.75rem 2rem;
  margin-bottom: 1.75rem;
  background: rgba(255,255,255,0.85);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(168,85,247,0.15);
  border-radius: 24px;
  box-shadow: 0 8px 24px rgba(168,85,247,0.08);
}
.dark-mode .schedule-header {
  background: rgba(255,255,255,0.05);
  border-color: rgba(255,255,255,0.10);
  box-shadow: 0 8px 40px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.08);
}

.header-main {
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

.icon-box {
  background: linear-gradient(135deg, #f472b6 0%, #a855f7 50%, #6366f1 100%);
  color: white;
  width: 60px; height: 60px;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 8px 28px rgba(168,85,247,0.65), 0 0 0 1px rgba(244,114,182,0.4);
}

.title-h1 {
  font-size: 1.875rem;
  font-weight: 800;
  letter-spacing: -0.03em;
  margin: 0;
  background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 50%, #0891b2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.dark-mode .title-h1 {
  background: linear-gradient(135deg, #f9a8d4 0%, #c084fc 40%, #67e8f9 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.title-sub {
  margin: 0.25rem 0 0 0;
  font-size: 0.9rem;
  color: #64748b;
}
.dark-mode .title-sub { color: #94a3b8; }

.header-stats {
  display: flex;
  align-items: center;
  gap: 1.75rem;
  background: rgba(168,85,247,0.06);
  padding: 1rem 1.75rem;
  border-radius: 16px;
  border: 1px solid rgba(168,85,247,0.12);
}
.dark-mode .header-stats {
  background: rgba(255,255,255,0.05);
  border-color: rgba(255,255,255,0.08);
}

.stat-item { display: flex; flex-direction: column; }

.stat-label {
  font-size: 0.7rem;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.stat-value {
  font-size: 1.375rem;
  font-weight: 800;
  color: #0f172a;
}
.dark-mode .stat-value { color: #ffffff; }

.stat-value.highlight {
  background: linear-gradient(135deg, #f472b6, #a855f7, #22d3ee);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.stat-divider {
  width: 1px; height: 28px;
  background: rgba(168,85,247,0.15);
}
.dark-mode .stat-divider { background: rgba(255,255,255,0.1); }

/* ── Header right group ─────────────────────────────────────── */
.header-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.6rem;
}

.btn-upload {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.55rem 1.2rem;
  border-radius: 12px;
  border: 1.5px solid rgba(168,85,247,0.35);
  background: linear-gradient(135deg, rgba(244,114,182,0.12), rgba(168,85,247,0.12));
  color: #7c3aed;
  font-family: inherit;
  font-size: 0.8125rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.25s;
  white-space: nowrap;
}
.dark-mode .btn-upload {
  border-color: rgba(244,114,182,0.4);
  background: linear-gradient(135deg, rgba(244,114,182,0.18), rgba(168,85,247,0.18));
  color: #f9a8d4;
}
.btn-upload:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 22px rgba(168,85,247,0.3);
  background: linear-gradient(135deg, rgba(244,114,182,0.2), rgba(168,85,247,0.2));
}
.dark-mode .btn-upload:hover {
  box-shadow: 0 6px 22px rgba(244,114,182,0.35);
}
.btn-upload.uploading { opacity: 0.7; cursor: default; pointer-events: none; }

.upload-msg {
  font-size: 0.78rem;
  font-weight: 600;
  padding: 0.3rem 0.75rem;
  border-radius: 8px;
}
.upload-msg.success {
  background: rgba(0,200,120,0.12);
  color: #059669;
  border: 1px solid rgba(0,200,120,0.25);
}
.dark-mode .upload-msg.success {
  background: rgba(0,230,118,0.12);
  color: #00e676;
  border-color: rgba(0,230,118,0.3);
}
.upload-msg.error {
  background: rgba(255,45,120,0.1);
  color: #be123c;
  border: 1px solid rgba(255,45,120,0.2);
}
.dark-mode .upload-msg.error {
  background: rgba(255,45,120,0.15);
  color: #ff8fab;
  border-color: rgba(255,45,120,0.3);
}

.spin { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* ── Assignment column ──────────────────────────────────────── */
.td-assignment { min-width: 180px; }

.assignment-chip {
  display: inline-block;
  padding: 0.3rem 0.75rem;
  border-radius: 8px;
  font-size: 0.78rem;
  font-weight: 700;
  background: rgba(234,88,12,0.1);
  color: #c2410c;
  border: 1px solid rgba(234,88,12,0.25);
}
.dark-mode .assignment-chip {
  background: rgba(251,146,60,0.12);
  color: #fb923c;
  border-color: rgba(251,146,60,0.3);
}

.assignment-empty {
  color: #cbd5e1;
  font-size: 0.85rem;
}
.dark-mode .assignment-empty { color: #334155; }

/* ── Edit row button ────────────────────────────────────────── */
.td-action { width: 48px; text-align: center; }

.btn-edit-row {
  background: rgba(168,85,247,0.1);
  border: 1px solid rgba(168,85,247,0.25);
  border-radius: 8px;
  color: #7c3aed;
  width: 32px; height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}
.dark-mode .btn-edit-row {
  background: rgba(192,132,252,0.12);
  border-color: rgba(192,132,252,0.3);
  color: #c084fc;
}
.btn-edit-row:hover:not(:disabled) {
  background: rgba(168,85,247,0.22);
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(168,85,247,0.3);
}
.btn-edit-row:disabled {
  opacity: 0.25;
  cursor: not-allowed;
  pointer-events: none;
}

/* ── Edit Modal ─────────────────────────────────────────────── */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.45);
  backdrop-filter: blur(4px);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.modal-box {
  background: #fff;
  border-radius: 20px;
  width: 100%;
  max-width: 440px;
  box-shadow: 0 24px 60px rgba(0,0,0,0.2);
  border: 1px solid rgba(168,85,247,0.15);
  overflow: hidden;
  animation: modalIn 0.25s cubic-bezier(0.16,1,0.3,1);
}
.modal-box.dark-mode {
  background: #0f0a2a;
  border-color: rgba(192,132,252,0.2);
  box-shadow: 0 24px 60px rgba(0,0,0,0.6);
}
@keyframes modalIn {
  from { opacity: 0; transform: scale(0.93) translateY(12px); }
  to   { opacity: 1; transform: scale(1)    translateY(0); }
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid rgba(168,85,247,0.1);
  background: linear-gradient(135deg, rgba(244,114,182,0.06), rgba(168,85,247,0.06));
}
.dark-mode .modal-header {
  border-color: rgba(192,132,252,0.15);
  background: rgba(255,255,255,0.03);
}

.modal-title {
  font-size: 1rem;
  font-weight: 800;
  margin: 0;
  background: linear-gradient(135deg, #7c3aed, #4f46e5);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.dark-mode .modal-title {
  background: linear-gradient(135deg, #f9a8d4, #c084fc);
  -webkit-background-clip: text;
  background-clip: text;
}

.modal-close {
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 4px;
  border-radius: 8px;
  display: flex;
  transition: all 0.2s;
}
.modal-close:hover { background: rgba(168,85,247,0.1); color: #7c3aed; }
.dark-mode .modal-close:hover { background: rgba(255,255,255,0.08); color: #c084fc; }

.modal-body {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
.form-group label {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #64748b;
}
.dark-mode .form-group label { color: #94a3b8; }

.modal-input {
  width: 100%;
  height: 42px;
  padding: 0 0.9rem;
  border: 1.5px solid rgba(168,85,247,0.2);
  border-radius: 10px;
  background: rgba(255,255,255,0.9);
  color: #1e293b;
  font-family: inherit;
  font-size: 0.875rem;
  font-weight: 500;
  outline: none;
  transition: all 0.2s;
  box-sizing: border-box;
  appearance: auto;
}
.dark-mode .modal-input {
  background: rgba(255,255,255,0.06);
  border-color: rgba(192,132,252,0.2);
  color: #e2e8f0;
  color-scheme: dark;
}
.modal-input:focus {
  border-color: #7c3aed;
  box-shadow: 0 0 0 3px rgba(124,58,237,0.15);
}
.dark-mode .modal-input:focus {
  border-color: #c084fc;
  box-shadow: 0 0 0 3px rgba(192,132,252,0.15);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid rgba(168,85,247,0.1);
}
.dark-mode .modal-footer { border-color: rgba(192,132,252,0.12); }

.btn-cancel {
  padding: 0.55rem 1.2rem;
  border: 1.5px solid rgba(100,116,139,0.3);
  border-radius: 10px;
  background: transparent;
  color: #64748b;
  font-family: inherit;
  font-size: 0.875rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-cancel:hover { background: rgba(100,116,139,0.08); }
.dark-mode .btn-cancel { color: #94a3b8; border-color: rgba(255,255,255,0.12); }
.dark-mode .btn-cancel:hover { background: rgba(255,255,255,0.06); }

.btn-save {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.55rem 1.3rem;
  border: none;
  border-radius: 10px;
  background: linear-gradient(135deg, #f472b6, #a855f7, #6366f1);
  color: white;
  font-family: inherit;
  font-size: 0.875rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(168,85,247,0.4);
  transition: all 0.2s;
}
.btn-save:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(168,85,247,0.5); }

/* ── Preview Modal ──────────────────────────────────────────── */
.preview-modal { max-width: 720px; max-height: 85vh; display: flex; flex-direction: column; }

.preview-subtitle {
  font-size: 0.78rem;
  color: #94a3b8;
  margin: 0.2rem 0 0;
  font-weight: 500;
}
.dark-mode .preview-subtitle { color: #64748b; }

.preview-table-wrap {
  overflow-y: auto;
  flex: 1;
  padding: 0 1.5rem;
}

.preview-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.8125rem;
}
.preview-table th {
  position: sticky;
  top: 0;
  padding: 0.65rem 0.75rem;
  text-align: left;
  font-size: 0.7rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #94a3b8;
  background: #fff;
  border-bottom: 1px solid rgba(168,85,247,0.12);
  z-index: 1;
}
.dark-mode .preview-table th {
  background: #0f0a2a;
  border-color: rgba(192,132,252,0.15);
  color: #475569;
}
.preview-table td {
  padding: 0.6rem 0.75rem;
  border-bottom: 1px solid rgba(168,85,247,0.06);
  color: #334155;
}
.dark-mode .preview-table td {
  border-color: rgba(255,255,255,0.05);
  color: #cbd5e1;
}
.preview-table tr:last-child td { border-bottom: none; }
.preview-table tr:hover td { background: rgba(168,85,247,0.03); }
.dark-mode .preview-table tr:hover td { background: rgba(255,255,255,0.03); }

.preview-num { color: #94a3b8; font-size: 0.72rem; width: 36px; }
.preview-name { font-weight: 700; }
.preview-email { color: #64748b; font-size: 0.78rem; }
.dark-mode .preview-email { color: #475569; }
.preview-assignment { color: #c2410c; font-size: 0.78rem; font-weight: 600; }
.dark-mode .preview-assignment { color: #fb923c; }

/* ═══════════════════════════════════════════════════════════════
   FILTER PANEL
═══════════════════════════════════════════════════════════════ */
.filter-glass {
  background: rgba(255,255,255,0.85);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(168,85,247,0.15);
  border-radius: 20px;
  padding: 1.5rem;
  margin-bottom: 1.75rem;
  box-shadow: 0 8px 24px rgba(168,85,247,0.08);
}
.dark-mode .filter-glass {
  background: rgba(255,255,255,0.05);
  border-color: rgba(255,255,255,0.10);
  box-shadow: 0 8px 32px rgba(0,0,0,0.25);
}

.filter-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.25rem;
  align-items: flex-end;
}

.input-wrapper label {
  display: block;
  font-size: 0.8rem;
  font-weight: 700;
  color: #475569;
  margin-bottom: 0.5rem;
  margin-left: 0.25rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
.dark-mode .input-wrapper label { color: #94a3b8; }

.select-wrap { width: 100%; }

.input-field {
  width: 100%;
  height: 46px;
  background: rgba(255,255,255,0.9);
  border: 1.5px solid rgba(168,85,247,0.18);
  border-radius: 12px;
  padding: 0 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #1e293b;
  font-family: inherit;
  transition: all 0.25s;
  box-sizing: border-box;
  outline: none;
  appearance: auto;
}
.dark-mode .input-field {
  background: rgba(255,255,255,0.07);
  border-color: rgba(255,255,255,0.1);
  color: #e2e8f0;
  color-scheme: dark;
}
.input-field:focus {
  border-color: #7c3aed;
  box-shadow: 0 0 0 4px rgba(124,58,237,0.18);
  background: rgba(124,58,237,0.06);
}
.dark-mode .input-field:focus {
  background: rgba(124,58,237,0.08);
}

.btn-reset {
  width: 100%;
  height: 46px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, rgba(244,114,182,0.12), rgba(168,85,247,0.12));
  border: 1.5px solid rgba(168,85,247,0.3);
  border-radius: 12px;
  color: #7c3aed;
  font-family: inherit;
  font-weight: 700;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.25s;
}
.dark-mode .btn-reset {
  background: linear-gradient(135deg, rgba(244,114,182,0.2), rgba(168,85,247,0.2));
  border-color: rgba(244,114,182,0.45);
  color: #f9a8d4;
}
.btn-reset:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 22px rgba(168,85,247,0.3);
}
.dark-mode .btn-reset:hover:not(:disabled) {
  box-shadow: 0 6px 22px rgba(244,114,182,0.4);
}
.btn-reset:disabled { opacity: 0.4; cursor: not-allowed; }

/* ═══════════════════════════════════════════════════════════════
   SCHEDULE CARD (List view)
═══════════════════════════════════════════════════════════════ */
.schedule-card {
  background: rgba(255,255,255,0.92);
  border-radius: 24px;
  border: 1px solid rgba(168,85,247,0.12);
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(168,85,247,0.08);
}
.dark-mode .schedule-card {
  background: rgba(255,255,255,0.04);
  border-color: rgba(255,255,255,0.08);
  box-shadow: 0 24px 60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06);
}

.table-responsive { overflow-x: auto; }

.schedule-table {
  width: 100%;
  border-collapse: collapse;
}

.schedule-table th {
  padding: 1.1rem 1.5rem;
  text-align: left;
  font-size: 0.7rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #94a3b8;
  background: rgba(168,85,247,0.04);
  border-bottom: 1px solid rgba(168,85,247,0.1);
}
.dark-mode .schedule-table th {
  background: rgba(255,255,255,0.04);
  border-color: rgba(255,255,255,0.07);
  color: #475569;
}

.schedule-row {
  border-left: 3px solid transparent;
  transition: background 0.2s;
}
.schedule-row td {
  padding: 1.1rem 1.5rem;
  border-bottom: 1px solid rgba(168,85,247,0.06);
}
.dark-mode .schedule-row td {
  border-color: rgba(255,255,255,0.05);
}
.schedule-row:hover { background: rgba(168,85,247,0.03); }
.dark-mode .schedule-row:hover { background: rgba(255,255,255,0.04); }

/* Today row */
.is-today {
  background: linear-gradient(90deg, rgba(168,85,247,0.08) 0%, rgba(99,102,241,0.04) 100%) !important;
  border-left: 3px solid #a855f7 !important;
}
.dark-mode .is-today {
  background: linear-gradient(90deg, rgba(168,85,247,0.15) 0%, rgba(99,102,241,0.07) 100%) !important;
  box-shadow: inset 4px 0 20px rgba(168,85,247,0.1);
}

/* Past row */
.is-past { opacity: 0.45; }
.is-past td { text-decoration: line-through; }
.is-past .badge-past,
.is-past .member-info,
.is-past .avatar-mini { text-decoration: none !important; }

/* ─── Date Block ─────────────────────────────────────────────── */
.date-block {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.calendar-icon {
  width: 50px; height: 56px;
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,0.1);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.calendar-icon.weekday .month-short {
  background: linear-gradient(135deg, #a855f7, #3b82f6);
}
.calendar-icon.weekend .month-short {
  background: linear-gradient(135deg, #ff2d78, #ff6b35);
}

.month-short {
  font-size: 0.6rem;
  font-weight: 800;
  color: white;
  padding: 3px 0;
  text-align: center;
}

.day-num {
  font-size: 1.375rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-grow: 1;
  background: rgba(255,255,255,0.08);
  color: #1e293b;
}
.dark-mode .day-num {
  background: rgba(255,255,255,0.05);
  color: #f1f5f9;
}

.date-text { display: flex; flex-direction: column; gap: 0.2rem; }
.full-date {
  font-weight: 600;
  font-size: 0.9rem;
  color: #1e293b;
}
.dark-mode .full-date { color: #e2e8f0; }
.weekday-label {
  font-size: 0.8rem;
  color: #64748b;
}
.dark-mode .weekday-label { color: #94a3b8; }

/* ─── Member Info ────────────────────────────────────────────── */
.member-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.avatar-mini {
  width: 38px; height: 38px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 0.9rem;
  flex-shrink: 0;
}

.member-name {
  font-weight: 700;
  font-size: 0.9375rem;
  color: #334155;
}
.dark-mode .member-name { color: #e2e8f0; }

/* ─── Status Badges ─────────────────────────────────────────── */
.badge {
  padding: 0.4rem 1rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.badge-today {
  background: linear-gradient(135deg, rgba(255,45,120,0.18), rgba(255,107,53,0.14));
  color: #be185d;
  border: 1px solid rgba(255,45,120,0.35);
}
.dark-mode .badge-today {
  background: linear-gradient(135deg, rgba(255,45,120,0.25), rgba(255,107,53,0.2));
  color: #ff8fab;
  border-color: rgba(255,45,120,0.55);
  box-shadow: 0 0 18px rgba(255,45,120,0.35), inset 0 1px 0 rgba(255,255,255,0.1);
}

.badge-upcoming {
  background: linear-gradient(135deg, rgba(79,70,229,0.12), rgba(99,102,241,0.08));
  color: #4f46e5;
  border: 1px solid rgba(79,70,229,0.3);
}
.dark-mode .badge-upcoming {
  background: linear-gradient(135deg, rgba(0,230,118,0.15), rgba(0,184,212,0.12));
  color: #00e676;
  border-color: rgba(0,230,118,0.4);
  box-shadow: 0 0 12px rgba(0,230,118,0.2);
}

.badge-past {
  background: rgba(100,116,139,0.1);
  color: #64748b;
  border: 1px solid rgba(100,116,139,0.18);
}
.dark-mode .badge-past {
  background: rgba(71,85,105,0.18);
  color: #4a5568;
  border-color: rgba(71,85,105,0.2);
}

/* ─── Pulse dot ─────────────────────────────────────────────── */
.pulse-dot {
  width: 7px; height: 7px;
  background: #ff2d78;
  border-radius: 50%;
  animation: pulse-dot 1.5s infinite;
}

@keyframes pulse-dot {
  0%   { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(255,45,120,0.8); }
  70%  { transform: scale(1);    box-shadow: 0 0 0 9px rgba(255,45,120,0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(255,45,120,0); }
}

/* ─── Empty state ────────────────────────────────────────────── */
.empty-state { padding: 4rem 0 !important; }
.empty-msg {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}
.empty-msg p {
  color: #64748b;
  font-weight: 500;
  margin: 0;
}
.dark-mode .empty-msg p { color: #475569; }
.text-btn {
  background: none;
  border: none;
  color: #a855f7;
  font-weight: 700;
  font-size: 0.875rem;
  cursor: pointer;
  padding: 0;
  text-decoration: underline;
  font-family: inherit;
}

/* ═══════════════════════════════════════════════════════════════
   CALENDAR VIEW
═══════════════════════════════════════════════════════════════ */
.calendar-section {
  background: rgba(255,255,255,0.85);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(168,85,247,0.15);
  border-radius: 24px;
  padding: 1.75rem;
  box-shadow: 0 8px 24px rgba(168,85,247,0.08);
}
.dark-mode .calendar-section {
  background: rgba(255,255,255,0.04);
  border-color: rgba(255,255,255,0.08);
  box-shadow: 0 24px 60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06);
}

/* Calendar nav bar */
.cal-nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.cal-month-label {
  font-size: 1.1rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: #1e293b;
}
.dark-mode .cal-month-label { color: #f1f5f9; }

.cal-nav-btn {
  background: rgba(168,85,247,0.1);
  border: 1.5px solid rgba(168,85,247,0.2);
  border-radius: 12px;
  color: #7c3aed;
  cursor: pointer;
  width: 40px; height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}
.dark-mode .cal-nav-btn {
  background: rgba(255,255,255,0.06);
  border-color: rgba(255,255,255,0.1);
  color: #c084fc;
}
.cal-nav-btn:hover {
  background: rgba(168,85,247,0.2);
  transform: scale(1.08);
}
.dark-mode .cal-nav-btn:hover {
  background: rgba(255,255,255,0.12);
}

/* Calendar grid */
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 6px;
}

.cal-dow {
  text-align: center;
  font-size: 0.7rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #64748b;
  padding: 0.5rem 0;
}
.dark-mode .cal-dow { color: #334155; }
.cal-dow-weekend { color: #db2777 !important; }
.dark-mode .cal-dow-weekend { color: #f472b6 !important; }

/* Day cell */
.cal-day {
  min-height: 84px;
  border-radius: 14px;
  padding: 0.55rem;
  border: 1px solid rgba(168,85,247,0.08);
  background: rgba(255,255,255,0.5);
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  transition: transform 0.2s, box-shadow 0.2s;
}
.dark-mode .cal-day {
  background: rgba(255,255,255,0.03);
  border-color: rgba(255,255,255,0.05);
}

.cal-day.other-month {
  opacity: 0.2;
  background: transparent;
  border-color: transparent;
}

.cal-day.has-duty:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 24px rgba(168,85,247,0.15);
}
.dark-mode .cal-day.has-duty:hover {
  box-shadow: 0 10px 24px rgba(0,0,0,0.35);
}

/* ── Filter: dimmed (non-matching current-month day) ── */
.cal-day.cal-dimmed {
  opacity: 0.12;
  filter: blur(1.5px) grayscale(0.6);
  pointer-events: none;
  transform: none !important;
}

/* ── Filter: highlighted (matching current-month day) — light mode ── */
.cal-day.cal-highlighted {
  box-shadow: 0 0 0 1.5px rgba(168,85,247,0.35), 0 6px 20px rgba(168,85,247,0.12);
  background: rgba(168,85,247,0.04);
  transform: translateY(-2px);
}
/* Dark mode override */
.dark-mode .cal-day.cal-highlighted {
  box-shadow: 0 0 0 1.5px rgba(255,255,255,0.18), 0 6px 20px rgba(0,0,0,0.3);
  background: rgba(255,255,255,0.07);
}

/* Today cell — triple-layer blink animation */
.cal-day.is-today-cal {
  position: relative;
  background: rgba(124,58,237,0.07);
  animation: today-border-blink-light 0.65s steps(1) infinite;
}
.dark-mode .cal-day.is-today-cal {
  background: rgba(168,85,247,0.12);
  animation: today-border-blink 0.65s steps(1) infinite;
}

@keyframes today-border-blink {
  0%, 49%  { border-color: rgba(192,132,252,0.95); box-shadow: 0 0 18px rgba(168,85,247,0.55); }
  50%, 100%{ border-color: rgba(168,85,247,0.15);  box-shadow: none; }
}
@keyframes today-border-blink-light {
  0%, 49%  { border-color: rgba(124,58,237,0.9);  box-shadow: 0 0 14px rgba(124,58,237,0.35); }
  50%, 100%{ border-color: rgba(124,58,237,0.12); box-shadow: none; }
}

/* Ping ring */
.cal-day.is-today-cal::before {
  content: '';
  position: absolute;
  top: 7px; right: 7px;
  width: 9px; height: 9px;
  border-radius: 50%;
  background: rgba(124,58,237,0.4);
  animation: today-ping 1s ease-out infinite;
}
.dark-mode .cal-day.is-today-cal::before {
  background: rgba(192,132,252,0.55);
}
@keyframes today-ping {
  0%        { transform: scale(1);   opacity: 0.85; }
  70%, 100% { transform: scale(3.2); opacity: 0; }
}

/* Solid dot */
.cal-day.is-today-cal::after {
  content: '';
  position: absolute;
  top: 7px; right: 7px;
  width: 9px; height: 9px;
  border-radius: 50%;
  background: #7c3aed;
  box-shadow: 0 0 8px rgba(124,58,237,0.85);
  animation: today-dot-blink 0.65s steps(1) infinite;
}
.dark-mode .cal-day.is-today-cal::after {
  background: #c084fc;
  box-shadow: 0 0 8px rgba(192,132,252,0.9);
}
@keyframes today-dot-blink {
  0%, 49%  { opacity: 1; }
  50%, 100%{ opacity: 0; }
}

/* Date number */
.cal-date-num {
  font-size: 0.8rem;
  font-weight: 800;
  color: #0f172a;
}
.dark-mode .cal-date-num { color: #f1f5f9; }
.cal-date-today { color: #7c3aed !important; }
.dark-mode .cal-date-today { color: #c084fc !important; }

/* Duty chip */
.cal-duty-chip {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.3rem 0.45rem;
  border-radius: 8px;
  font-size: 0.7rem;
  font-weight: 800;
}
.chip-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

/* ═══════════════════════════════════════════════════════════════
   FLOATING CONTROLS BAR
═══════════════════════════════════════════════════════════════ */
.floating-bar {
  position: fixed;
  bottom: 1.75rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 4px;
  background: rgba(255,255,255,0.92);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(168,85,247,0.22);
  border-radius: 999px;
  padding: 5px;
  box-shadow: 0 8px 40px rgba(168,85,247,0.18), 0 2px 12px rgba(0,0,0,0.1);
  animation: floatIn 0.5s cubic-bezier(0.16,1,0.3,1);
}
.dark-mode .floating-bar {
  background: rgba(10,8,35,0.82);
  border-color: rgba(255,255,255,0.14);
  box-shadow: 0 8px 40px rgba(0,0,0,0.5), 0 2px 8px rgba(168,85,247,0.2);
}
@keyframes floatIn {
  from { opacity: 0; transform: translateX(-50%) translateY(20px); }
  to   { opacity: 1; transform: translateX(-50%) translateY(0); }
}

.view-pill, .theme-pill {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.55rem 1.1rem;
  border-radius: 999px;
  border: none;
  font-family: inherit;
  font-size: 0.8125rem;
  font-weight: 700;
  cursor: pointer;
  background: transparent;
  color: #64748b;
  transition: all 0.2s;
}
.dark-mode .view-pill,
.dark-mode .theme-pill { color: #94a3b8; }

.view-pill:hover, .theme-pill:hover {
  background: rgba(168,85,247,0.1);
  color: #7c3aed;
}
.dark-mode .view-pill:hover,
.dark-mode .theme-pill:hover {
  background: rgba(255,255,255,0.1);
  color: #e2e8f0;
}

.view-pill.active {
  background: linear-gradient(135deg, #f472b6, #a855f7, #6366f1);
  color: white !important;
  box-shadow: 0 4px 14px rgba(168,85,247,0.5);
}

.bar-divider {
  width: 1px; height: 22px;
  background: rgba(168,85,247,0.2);
  margin: 0 2px;
}
.dark-mode .bar-divider { background: rgba(255,255,255,0.12); }

/* ═══════════════════════════════════════════════════════════════
   ENTRANCE ANIMATIONS
═══════════════════════════════════════════════════════════════ */
.animate-slide-down { animation: slideDown 0.6s cubic-bezier(0.16,1,0.3,1); }
.animate-fade-in    { animation: fadeIn    0.8s ease; }
.animate-fade-in-up { animation: fadeInUp  0.8s cubic-bezier(0.16,1,0.3,1); }

@keyframes slideDown {
  from { transform: translateY(-20px); opacity: 0; }
  to   { transform: translateY(0);     opacity: 1; }
}
@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}
@keyframes fadeInUp {
  from { transform: translateY(30px); opacity: 0; }
  to   { transform: translateY(0);    opacity: 1; }
}

/* ═══════════════════════════════════════════════════════════════
   RESPONSIVE — tablet (≤ 768px)
═══════════════════════════════════════════════════════════════ */
@media (max-width: 768px) {
  /* Layout */
  .roaster-container { margin: -2rem -1rem -2rem -1rem; padding: 1.25rem 1rem 8rem; }
  .schedule-header   { flex-direction: column; align-items: flex-start; gap: 1.25rem; }
  .header-right      { width: 100%; align-items: stretch; }
  .header-stats      { width: 100%; justify-content: space-around; padding: 0.75rem 1rem; }
  .btn-upload        { justify-content: center; }
  .title-h1          { font-size: 1.4rem; }
  .filter-row        { grid-template-columns: 1fr; gap: 1rem; }

  /* Calendar wrapper */
  .calendar-section { padding: 1rem 0.75rem; }
  .cal-nav-bar      { margin-bottom: 1rem; }
  .cal-month-label  { font-size: 0.95rem; }

  /* Grid */
  .calendar-grid { gap: 3px; }
  .cal-dow { font-size: 0.6rem; letter-spacing: 0.02em; padding: 0.3rem 0; }
  .cal-day  { min-height: 64px; padding: 0.3rem 0.25rem; border-radius: 8px; gap: 0.2rem; }
  .cal-date-num { font-size: 0.7rem; }

  /* Duty chip — like a mobile calendar event pill:
     hide the dot, show the name truncated, fill cell width */
  .chip-dot { display: none; }
  .cal-duty-chip {
    gap: 0;
    padding: 0.16rem 0.25rem;
    border-radius: 4px;
    font-size: 0.58rem;
    font-weight: 800;
    max-width: 100%;
    overflow: hidden;
    white-space: nowrap;
  }
  /* The name span must be the one that truncates */
  .cal-duty-chip span:last-child {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    min-width: 0;
  }

  /* Today dots — tuck them in so they don't crowd date number */
  .cal-day.is-today-cal::before,
  .cal-day.is-today-cal::after { top: 4px; right: 4px; width: 7px; height: 7px; }
}

/* ═══════════════════════════════════════════════════════════════
   RESPONSIVE — phone (≤ 480px)
═══════════════════════════════════════════════════════════════ */
@media (max-width: 480px) {
  .roaster-container { padding: 1rem 0.75rem 8rem; }
  .calendar-section  { padding: 0.75rem 0.5rem; }

  /* Even tighter grid */
  .calendar-grid { gap: 2px; }
  .cal-dow  { font-size: 0.52rem; padding: 0.25rem 0; letter-spacing: 0; }
  .cal-day  { min-height: 54px; padding: 0.22rem 0.2rem; border-radius: 6px; gap: 0.15rem; }
  .cal-date-num { font-size: 0.62rem; }

  /* Even smaller name pill */
  .cal-duty-chip {
    padding: 0.12rem 0.18rem;
    border-radius: 3px;
    font-size: 0.5rem;
  }

  /* Today dots */
  .cal-day.is-today-cal::before,
  .cal-day.is-today-cal::after { top: 3px; right: 3px; width: 6px; height: 6px; }

  /* Floating bar */
  .floating-bar { padding: 4px; gap: 2px; }
  .view-pill, .theme-pill { padding: 0.45rem 0.7rem; font-size: 0.75rem; gap: 0.3rem; }
}
</style>
