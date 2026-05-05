<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-4 md:p-6 lg:p-8">
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-1">
        Meter Replacement
      </h1>
      <p class="text-gray-500 text-sm">Manage and process meter replacement records from CMO</p>
    </div>

    <!-- Tabs -->
    <div class="flex gap-2 mb-6 border-b border-gray-200">
      <button
        v-for="tab in tabs" :key="tab.id"
        @click="activeTab = tab.id"
        :class="[
          'px-5 py-2.5 text-sm font-semibold rounded-t-xl transition-all duration-200',
          activeTab === tab.id
            ? 'bg-white text-indigo-600 border border-b-white border-gray-200 -mb-px shadow-sm'
            : 'text-gray-500 hover:text-gray-700'
        ]"
      >{{ tab.label }}</button>
    </div>

    <!-- ===== TAB: CMO RECORDS ===== -->
    <div v-if="activeTab === 'cmo'">
      <!-- Stats Cards -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6" v-if="stats">
        <div class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-5 text-white shadow-lg">
          <p class="text-blue-100 text-xs font-medium mb-1">Total</p>
          <p class="text-3xl font-bold">{{ stats.total }}</p>
        </div>
        <div class="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl p-5 text-white shadow-lg">
          <p class="text-yellow-100 text-xs font-medium mb-1">Open</p>
          <p class="text-3xl font-bold">{{ stats.open }}</p>
        </div>
        <div class="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-5 text-white shadow-lg">
          <p class="text-purple-100 text-xs font-medium mb-1">In Process</p>
          <p class="text-3xl font-bold">{{ stats.inProcess }}</p>
        </div>
        <div class="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-5 text-white shadow-lg">
          <p class="text-green-100 text-xs font-medium mb-1">Resolved</p>
          <p class="text-3xl font-bold">{{ stats.resolved }}</p>
        </div>
      </div>

      <!-- Filters + Actions -->
      <div class="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 p-5 mb-6">
        <div class="flex flex-wrap gap-4 items-end">
          <!-- Search -->
          <div class="flex-1 min-w-[200px]">
            <label class="block text-xs font-medium text-gray-600 mb-1">Search</label>
            <input
              v-model="filters.search"
              @input="debouncedFetch"
              type="text"
              placeholder="Customer ID, name, meter..."
              class="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none"
            />
          </div>
          <!-- Status -->
          <div class="min-w-[150px]">
            <label class="block text-xs font-medium text-gray-600 mb-1">Status</label>
            <select
              v-model="filters.status"
              @change="fetchRecords"
              class="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none bg-white"
            >
              <option value="">All Status</option>
              <option value="Open">Open</option>
              <option value="InProcess">In Process</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
          <!-- Clear -->
          <button @click="clearFilters" class="px-4 py-2 border border-gray-300 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors">
            Clear
          </button>
          <!-- Spacer -->
          <div class="flex-1"></div>
          <!-- Process All Open -->
          <button
            @click="handleProcessAllOpen"
            :disabled="processingAll || stats?.open === 0"
            class="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl text-sm font-semibold shadow hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <svg v-if="processingAll" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke-width="2" stroke-dasharray="31.4" stroke-dashoffset="10" stroke="currentColor"/></svg>
            {{ processingAll ? 'Processing...' : `Process All Open (${stats?.open ?? 0})` }}
          </button>
          <!-- Refresh -->
          <button @click="refresh" :disabled="loading" class="px-4 py-2 border border-gray-300 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-2 disabled:opacity-50">
            <svg class="w-4 h-4" :class="{ 'animate-spin': loading }" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
            Refresh
          </button>
        </div>
      </div>

      <!-- Process Result Banner -->
      <div v-if="processResult" class="bg-indigo-50 border border-indigo-200 rounded-xl p-4 mb-5 flex items-start justify-between gap-4">
        <div>
          <p class="font-semibold text-indigo-800 mb-1">Processing Complete — {{ processResult.length }} records</p>
          <div class="max-h-40 overflow-y-auto space-y-1">
            <p v-for="r in processResult" :key="r.id" class="text-xs" :class="r.remarks?.startsWith('Error') ? 'text-red-600' : 'text-indigo-600'">
              <span class="font-mono font-medium">{{ r['Customer ID'] }}</span> — {{ r.remarks }}
            </p>
          </div>
        </div>
        <button @click="processResult = null" class="text-indigo-400 hover:text-indigo-600 shrink-0">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="bg-white/80 rounded-2xl shadow p-12 flex flex-col items-center">
        <div class="animate-spin rounded-full h-10 w-10 border-4 border-indigo-200 border-t-indigo-600 mb-3"></div>
        <p class="text-gray-400 text-sm">Loading records...</p>
      </div>

      <!-- Empty -->
      <div v-else-if="!loading && records.length === 0" class="bg-white/80 rounded-2xl shadow p-12 flex flex-col items-center">
        <p class="text-gray-400 font-medium">No records found</p>
        <p class="text-gray-300 text-sm mt-1">Try adjusting your filters</p>
      </div>

      <!-- Table -->
      <div v-else class="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 overflow-hidden mb-6">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 text-sm">
            <thead class="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Consumer ID</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Customer Name</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Old Meter</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">New Meter</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Replace Date</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Install Date</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Remarks</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-100">
              <tr v-for="rec in records" :key="rec.Id" class="hover:bg-blue-50/40 transition-colors">
                <td class="px-4 py-3 font-mono text-xs font-medium text-gray-800">{{ rec.OldConsumerId || '—' }}</td>
                <td class="px-4 py-3 text-gray-700 max-w-[180px] truncate" :title="rec.CustomerName">{{ rec.CustomerName || '—' }}</td>
                <td class="px-4 py-3 font-mono text-xs text-gray-600">{{ rec.OldMeterNumber || '—' }}</td>
                <td class="px-4 py-3 font-mono text-xs text-gray-600">{{ rec.ReplaceMeterNumber || '—' }}</td>
                <td class="px-4 py-3 text-gray-500 whitespace-nowrap">{{ rec.ReplaceDate || '—' }}</td>
                <td class="px-4 py-3 text-gray-500 whitespace-nowrap">{{ rec.InstallDate || '—' }}</td>
                <td class="px-4 py-3 text-gray-500 max-w-[200px] truncate text-xs" :title="rec.Remarks">{{ rec.Remarks || '—' }}</td>
                <td class="px-4 py-3 whitespace-nowrap">
                  <span :class="statusClass(rec.Status)" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold">
                    {{ rec.Status }}
                  </span>
                </td>
                <td class="px-4 py-3 whitespace-nowrap">
                  <div class="flex gap-2">
                    <button
                      v-if="rec.Status === 'Open'"
                      @click="handleProcessOne(rec)"
                      :disabled="processingId === rec.Id"
                      class="px-2.5 py-1 bg-orange-500 text-white rounded-lg text-xs font-semibold hover:bg-orange-600 disabled:opacity-50 transition-colors"
                    >{{ processingId === rec.Id ? '...' : 'Process' }}</button>
                    <button
                      v-if="rec.Status === 'InProcess'"
                      @click="handleResolve(rec)"
                      :disabled="resolvingId === rec.Id"
                      class="px-2.5 py-1 bg-green-500 text-white rounded-lg text-xs font-semibold hover:bg-green-600 disabled:opacity-50 transition-colors"
                    >{{ resolvingId === rec.Id ? '...' : 'Mark Done' }}</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="pagination && pagination.totalPages > 1" class="flex items-center justify-between gap-4">
        <p class="text-sm text-gray-500">Page {{ pagination.page }} of {{ pagination.totalPages }} ({{ pagination.total }} total)</p>
        <div class="flex gap-1">
          <button @click="goToPage(1)" :disabled="pagination.page <= 1" class="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 transition-colors">First</button>
          <button @click="goToPage(pagination.page - 1)" :disabled="pagination.page <= 1" class="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 transition-colors">Prev</button>
          <button @click="goToPage(pagination.page + 1)" :disabled="pagination.page >= pagination.totalPages" class="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 transition-colors">Next</button>
          <button @click="goToPage(pagination.totalPages)" :disabled="pagination.page >= pagination.totalPages" class="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 transition-colors">Last</button>
        </div>
      </div>
    </div>

    <!-- ===== TAB: CSV TOOL ===== -->
    <div v-if="activeTab === 'csv'">
      <div class="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 p-6 mb-6">
        <h2 class="text-xl font-bold text-indigo-700 mb-4">Upload CSV</h2>
        <div
          class="border-2 border-dashed border-indigo-200 rounded-xl p-10 text-center hover:border-indigo-400 transition-colors cursor-pointer"
          @dragover.prevent @dragenter.prevent @drop.prevent="onDrop"
        >
          <svg class="w-12 h-12 text-indigo-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 17V3M12 3l-4 4M12 3l4 4"/><rect x="4" y="17" width="16" height="4" rx="2"/>
          </svg>
          <p class="text-indigo-500 font-semibold mb-1">Drag and drop CSV here</p>
          <p class="text-gray-400 text-sm mb-3">or</p>
          <label class="cursor-pointer px-5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm font-semibold shadow hover:shadow-md transition-all">
            Choose CSV file
            <input type="file" class="hidden" accept=".csv" @change="handleFileUpload" />
          </label>
          <div v-if="csvProcessing" class="mt-3 text-sm text-indigo-500 animate-pulse">Processing file…</div>
        </div>
      </div>

      <div class="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 p-6 mb-6">
        <h2 class="text-xl font-bold text-indigo-700 mb-4">Manual Entry</h2>
        <form @submit.prevent="addManualRecord" class="grid grid-cols-1 md:grid-cols-5 gap-3">
          <input v-model="manualRecord.CUSTID" placeholder="Customer ID" class="px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none" />
          <input v-model="manualRecord.OLDMETER" placeholder="Old Meter Number" class="px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none" />
          <input v-model="manualRecord.NEWMETER" placeholder="New Meter Number" class="px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none" />
          <input type="date" v-model="manualRecord.METERCNGDATE" class="px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none" />
          <button type="submit" class="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm font-semibold shadow hover:shadow-md transition-all">Add Record</button>
        </form>
        <p v-if="manualError" class="text-red-500 text-sm mt-2">{{ manualError }}</p>
      </div>

      <!-- CSV Preview -->
      <div v-if="csvData.length > 0" class="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-bold text-indigo-700">Preview — {{ csvData.length }} records</h2>
          <div class="flex gap-2">
            <button @click="exportCSV" class="px-4 py-2 bg-green-500 text-white rounded-xl text-sm font-semibold hover:bg-green-600 transition-colors">Export CSV</button>
            <button @click="exportExcel" class="px-4 py-2 bg-teal-500 text-white rounded-xl text-sm font-semibold hover:bg-teal-600 transition-colors">Export Excel</button>
          </div>
        </div>
        <!-- Meter chips -->
        <div class="flex flex-wrap gap-2 mb-4 p-3 bg-gray-50 rounded-xl">
          <span
            v-for="(row, i) in csvData" :key="i"
            :class="row.remarks?.startsWith('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'"
            class="px-3 py-1 rounded-full text-xs font-semibold"
            :title="row.remarks"
          >{{ row['New Meter Number'] || row['Replace Meter Number'] || '—' }}</span>
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-full text-sm border border-gray-200 rounded-xl overflow-hidden">
            <thead class="bg-indigo-600 text-white">
              <tr>
                <th v-for="h in csvHeaders" :key="h" class="px-3 py-2 text-left text-xs font-semibold">{{ h }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="(row, idx) in csvData" :key="idx" class="hover:bg-gray-50">
                <td v-for="h in csvHeaders" :key="h" class="px-3 py-2 text-gray-700">{{ formatCell(row, h) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import * as XLSX from 'xlsx';
import api from '../api';
import {
  getCMOMeterReplacements,
  getCMOMeterReplacementStats,
  processCMOMeterReplacement,
  processAllOpenCMOMeterReplacements,
  updateCMOMeterReplacementStatus,
} from '../api';

// ---- Tabs ----
const tabs = [
  { id: 'cmo', label: 'CMO Records' },
  { id: 'csv', label: 'CSV Tool' },
];
const activeTab = ref('cmo');

// ---- CMO Records State ----
const records = ref<any[]>([]);
const stats = ref<{ open: number; inProcess: number; resolved: number; total: number } | null>(null);
const pagination = ref<{ page: number; limit: number; total: number; totalPages: number } | null>(null);
const loading = ref(false);
const processingAll = ref(false);
const processingId = ref<number | null>(null);
const resolvingId = ref<number | null>(null);
const processResult = ref<any[] | null>(null);

const filters = ref({ search: '', status: '', page: 1, limit: 20 });

let debounceTimer: ReturnType<typeof setTimeout> | null = null;
const debouncedFetch = () => {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => { filters.value.page = 1; fetchRecords(); }, 400);
};

const fetchRecords = async () => {
  loading.value = true;
  try {
    const params: Record<string, any> = { page: filters.value.page, limit: filters.value.limit };
    if (filters.value.search) params.search = filters.value.search;
    if (filters.value.status) params.status = filters.value.status;
    const res = await getCMOMeterReplacements(params);
    records.value = res.data?.data || [];
    pagination.value = res.data?.pagination || null;
  } catch (e) {
    records.value = [];
  } finally {
    loading.value = false;
  }
};

const fetchStats = async () => {
  try {
    const res = await getCMOMeterReplacementStats();
    stats.value = res.data?.data || null;
  } catch {}
};

const refresh = () => { fetchRecords(); fetchStats(); };
const clearFilters = () => { filters.value = { search: '', status: '', page: 1, limit: 20 }; fetchRecords(); };
const goToPage = (p: number) => { if (!pagination.value) return; filters.value.page = p; fetchRecords(); };

const handleProcessAllOpen = async () => {
  processingAll.value = true;
  processResult.value = null;
  try {
    const res = await processAllOpenCMOMeterReplacements();
    processResult.value = res.data?.data || [];
    refresh();
  } catch (e: any) {
    alert(e.response?.data?.message || 'Failed to process records');
  } finally {
    processingAll.value = false;
  }
};

const handleProcessOne = async (rec: any) => {
  processingId.value = rec.Id;
  try {
    await processCMOMeterReplacement(rec.Id, {
      OldConsumerId: rec.OldConsumerId,
      OldMeterNumber: rec.OldMeterNumber,
      ReplaceMeterNumber: rec.ReplaceMeterNumber,
      ReplaceDate: rec.ReplaceDate,
      CustomerName: rec.CustomerName,
    });
    refresh();
  } catch (e: any) {
    alert(e.response?.data?.message || 'Failed to process record');
  } finally {
    processingId.value = null;
  }
};

const handleResolve = async (rec: any) => {
  resolvingId.value = rec.Id;
  try {
    await updateCMOMeterReplacementStatus(rec.Id, 'Resolved');
    refresh();
  } catch (e: any) {
    alert(e.response?.data?.message || 'Failed to update status');
  } finally {
    resolvingId.value = null;
  }
};

const statusClass = (status: string) => {
  if (status === 'Open') return 'bg-yellow-100 text-yellow-800';
  if (status === 'InProcess') return 'bg-purple-100 text-purple-800';
  if (status === 'Resolved') return 'bg-green-100 text-green-800';
  return 'bg-gray-100 text-gray-600';
};

// ---- CSV Tool State ----
const csvData = ref<any[]>([]);
const csvHeaders = ref<string[]>([]);
const csvProcessing = ref(false);
const manualRecord = ref({ CUSTID: '', OLDMETER: '', NEWMETER: '', METERCNGDATE: '' });
const manualError = ref('');

const CSV_HEADERS = ['NOCS', 'Customer ID', 'Old Meter Number', 'Replace Meter Number', 'Install Date', 'Replace Date', 'Last Bill Date', 'TARIFF', 'SANCTION_LOAD', 'Phase', 'Remarks'];

const handleFileUpload = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (file) await uploadFile(file);
};

const onDrop = async (e: DragEvent) => {
  const file = e.dataTransfer?.files?.[0];
  if (file) await uploadFile(file);
};

const uploadFile = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  csvProcessing.value = true;
  try {
    const res = await api.post('/meter-replacement/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    csvData.value = res.data || [];
    csvHeaders.value = csvData.value.length > 0 ? CSV_HEADERS : [];
  } catch (e: any) {
    alert(e?.response?.data || 'Error uploading file.');
  } finally {
    csvProcessing.value = false;
  }
};

const addManualRecord = async () => {
  manualError.value = '';
  const { CUSTID, OLDMETER, NEWMETER, METERCNGDATE } = manualRecord.value;
  if (!CUSTID || !OLDMETER || !NEWMETER || !METERCNGDATE) {
    manualError.value = 'Please fill all fields.';
    return;
  }
  try {
    const res = await api.post('/meter-replacement/process-row', {
      CUSTID, OLDMETER, NEWMETER, METERCNGDATE,
      'Customer ID': CUSTID, 'Old Meter Number': OLDMETER, 'New Meter Number': NEWMETER, 'Replace Date': METERCNGDATE,
    });
    csvData.value.push(res.data);
    csvHeaders.value = CSV_HEADERS;
    manualRecord.value = { CUSTID: '', OLDMETER: '', NEWMETER: '', METERCNGDATE: '' };
  } catch (e: any) {
    manualError.value = e?.response?.data || 'Error processing the row.';
  }
};

const exportCSV = () => {
  const data = csvData.value.map(row => ({
    CUSTID: row['Customer ID'], OLDMETER: row['Old Meter Number'], NEWMETER: row['New Meter Number'],
    HES: row.hes, NETMETER: row.netMeter, MANUFACTURER: row.manufacturer, MODEL: row.model,
    METERCNGDATE: row['Replace Date'], PHASE: row.phase, ADDRESS: row.address,
    OLDSANCTIONLOAD: row.sanctionLoad, NEWSANCTIONLOAD: row.sanctionLoad,
  }));
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Meter Replacement');
  const csv = XLSX.write(wb, { bookType: 'csv', type: 'string' });
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', 'meter_replacement.csv');
  document.body.appendChild(link); link.click(); document.body.removeChild(link);
};

const exportExcel = () => {
  const data = csvData.value.map(row => ({
    NOCS: row.nocs || '', 'Customer ID': row['Customer ID'] || '',
    'Old Meter Number': row['Old Meter Number'] || '', 'Replace Meter Number': row['New Meter Number'] || row['Replace Meter Number'] || '',
    'Install Date': row.installDate || '', 'Replace Date': row['Replace Date'] || '',
    'Last Bill Date': row.lastBillDate || '', TARIFF: row.tariff || '',
    SANCTION_LOAD: row.sanctionLoad || '', Phase: row.phase || '',
    Address: row.address || '', Remarks: row.remarks || '',
  }));
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Meter Replacement');
  XLSX.writeFile(wb, 'meter_replacement.xlsx');
};

const formatCell = (row: any, header: string) => {
  const map: Record<string, string> = {
    'NOCS': 'nocs', 'Customer ID': 'Customer ID', 'Old Meter Number': 'Old Meter Number',
    'Replace Meter Number': 'New Meter Number', 'Install Date': 'installDate',
    'Replace Date': 'Replace Date', 'Last Bill Date': 'lastBillDate',
    'TARIFF': 'tariff', 'SANCTION_LOAD': 'sanctionLoad', 'Phase': 'phase', 'Remarks': 'remarks',
  };
  return row[map[header] || header] ?? row[header] ?? '';
};

onMounted(() => { fetchRecords(); fetchStats(); });
</script>
