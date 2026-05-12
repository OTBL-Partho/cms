<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-4 md:p-6 lg:p-8">

    <!-- Header -->
    <div class="mb-8 animate-fadeIn">
      <div class="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 class="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
            CMO Customer Search
          </h1>
          <p class="text-gray-600 text-sm md:text-base">Search customer &amp; meter details by customer number or meter number</p>
        </div>
      </div>
    </div>

    <!-- Search Bar -->
    <div class="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 mb-8 border border-white/20">
      <div class="flex items-center gap-2 mb-4">
        <svg class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <h2 class="text-lg font-semibold text-gray-800">Search</h2>
      </div>
      <div class="flex gap-3">
        <div class="relative flex-1">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            v-model="query"
            @keyup.enter="search"
            type="text"
            placeholder="Enter customer number or meter number… or paste multiple IDs comma-separated"
            class="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            :disabled="loading"
          />
          <button v-if="query" @click="clearSearch" class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <button
          @click="clearSearch"
          :disabled="loading"
          class="px-6 py-2.5 bg-gradient-to-r from-gray-400 to-gray-500 text-white rounded-xl font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
          Clear
        </button>
        <button
          @click="search"
          :disabled="loading || !query.trim()"
          class="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          <svg v-if="loading" class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke-width="2" stroke-dasharray="31.4" stroke-dashoffset="10" />
          </svg>
          <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          {{ loading ? 'Searching...' : 'Search' }}
        </button>
      </div>
      <p v-if="error" class="mt-3 text-sm text-red-600 font-medium">{{ error }}</p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-12 mb-8 border border-white/20 flex flex-col items-center justify-center">
      <div class="animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 border-t-indigo-600 mb-4"></div>
      <p class="text-gray-500 font-medium">Searching...</p>
    </div>

    <!-- Empty State (after search, no results) -->
    <div v-else-if="searched && results.length === 0 && !error" class="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-12 mb-8 border border-white/20 flex flex-col items-center justify-center">
      <svg class="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <p class="text-gray-500 font-medium mb-2">No records found for "{{ lastQuery }}"</p>
      <p class="text-gray-400 text-sm">Try a different customer number or meter number</p>
    </div>

    <!-- Results Table -->
    <div v-else-if="results.length > 0">
      <!-- Row count + Export -->
      <div class="flex items-center justify-between mb-4">
        <div>
          <p class="text-sm text-gray-600">
            Showing {{ results.length }} record{{ results.length !== 1 ? 's' : '' }} for "{{ lastQuery }}"
          </p>
          <p v-if="foundTerms.length > 0" class="text-sm text-green-600 font-medium mt-1">
            Found: {{ foundTerms.join(', ') }}
          </p>
          <p v-if="missingTerms.length > 0" class="text-sm text-orange-600 font-medium mt-1">
            Not found: {{ missingTerms.join(', ') }}
          </p>
        </div>
        <button
          @click="exportToExcel"
          :disabled="exporting"
          class="group px-4 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          <svg v-if="!exporting" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
            <polyline points="14,2 14,8 20,8" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" />
          </svg>
          <svg v-else class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke-width="2" stroke-dasharray="31.4" stroke-dashoffset="10" />
          </svg>
          {{ exporting ? 'Exporting...' : 'Export Excel' }}
        </button>
      </div>

      <div class="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 overflow-hidden mb-8">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th class="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Customer No.</th>
                <th class="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">New Meter No</th>
                <th class="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Install Dt</th>
                <th class="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">NOCS</th>
                <th class="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">MDM Entry</th>
                <th class="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Mobile</th>
                <th class="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Changed Mobile</th>
                <th class="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Secondary Mobile</th>
                <th class="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Lat</th>
                <th class="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Long</th>
                <th class="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                <th class="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Address</th>
                <th class="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Old Consumer ID</th>
                <th class="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Old Meter No</th>
                <th class="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Old Reading</th>
                <th class="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">New Meter Type</th>
                <th class="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Approved</th>
                <th class="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Revisit</th>
                <th class="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Installed By</th>
                <th class="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Created By</th>
                <th class="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Created At</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-100">
              <tr v-for="(row, idx) in results" :key="row.Id || idx" class="hover:bg-blue-50/50 transition-colors duration-150">
                <td class="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{{ row.OldConsumerId || '-' }}</td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{{ row.NewMeterNoOCR || '-' }}</td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{{ row.InstallDate || '-' }}</td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{{ row.CustomerNOCS || '-' }}</td>
                <td class="px-4 py-3 whitespace-nowrap text-sm">
                  <span v-if="row.IsMDMEntry" class="text-green-600 font-medium">Yes</span>
                  <span v-else class="text-gray-400">No</span>
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{{ row.CustomerMobile || row.MobileNo || '-' }}</td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{{ row.ChangedMobileNo || '-' }}</td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{{ row.SecondaryMobileNo || '-' }}</td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{{ row.Latitude || '-' }}</td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{{ row.Longitude || '-' }}</td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{{ row.CustomerName || '-' }}</td>
                <td class="px-4 py-3 text-sm text-gray-600 max-w-[200px] truncate" :title="row.CustomerAddress || ''">{{ row.CustomerAddress || '-' }}</td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{{ row.OldConsumerId || '-' }}</td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{{ row.OldMeterNoOCR || '-' }}</td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{{ row.OldMeterReadingOCR || '-' }}</td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{{ row.NewMeterType || '-' }}</td>
                <td class="px-4 py-3 whitespace-nowrap">
                  <span :class="row.IsApproved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold">
                    {{ row.IsApproved ? 'Approved' : 'Pending' }}
                  </span>
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-sm">
                  <span v-if="row.HasRevisit" class="text-orange-600 font-medium">Yes</span>
                  <span v-else class="text-gray-400">No</span>
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{{ row.MeterInstalledBy || '-' }}</td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{{ row.InstallerName || '-' }}</td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{{ row.CreateDate || '-' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { getCMOCustomerSearch, getCMOMultiSearch } from '../api';
import * as XLSX from 'xlsx';

const query        = ref('');
const loading      = ref(false);
const error        = ref('');
const results      = ref<any[]>([]);
const searched     = ref(false);
const lastQuery    = ref('');
const exporting    = ref(false);
const missingTerms = ref<string[]>([]);
const foundTerms   = ref<string[]>([]);

const search = async () => {
  if (!query.value.trim()) return;
  loading.value      = true;
  error.value        = '';
  results.value      = [];
  missingTerms.value = [];
  foundTerms.value   = [];
  lastQuery.value    = query.value.trim();
  searched.value     = false;
  try {
    const q = query.value.trim();
    const isMulti = q.includes(',');
    const res = isMulti
      ? await getCMOMultiSearch(q)
      : await getCMOCustomerSearch(q);
    const all: any[] = res.data?.data || [];

    // Build list of search terms (lowercased)
    const terms = (isMulti ? q.split(',') : [q])
      .map(s => s.trim().toLowerCase())
      .filter(Boolean);

    // 8-digit number starting with 7, 8, or 9 → meter number
    const isMeterNo = (s: string) => /^[789]\d{7}$/.test(s);

    // Exact match only — route each term to the correct field
    results.value = all.filter(row =>
      terms.some(term => {
        if (isMeterNo(term)) {
          return String(row.NewMeterNoOCR ?? '').toLowerCase() === term;
        }
        return (
          String(row.OldConsumerId ?? '').toLowerCase() === term ||
          String(row.CustomerId ?? '').toLowerCase() === term
        );
      })
    );

    // Compute which terms had no match
    if (isMulti) {
      const matched = new Set(
        results.value.flatMap(row => [
          String(row.OldConsumerId ?? '').toLowerCase(),
          String(row.CustomerId ?? '').toLowerCase(),
          String(row.NewMeterNoOCR ?? '').toLowerCase(),
        ])
      );
      missingTerms.value = terms.filter(t => !matched.has(t));
      foundTerms.value   = terms.filter(t =>  matched.has(t));
    }
  } catch (err: any) {
    error.value = err.response?.data?.message || err.message || 'Search failed';
  } finally {
    loading.value = false;
    searched.value = true;
  }
};

const clearSearch = () => {
  query.value        = '';
  results.value      = [];
  error.value        = '';
  searched.value     = false;
  missingTerms.value = [];
  foundTerms.value   = [];
};

const exportToExcel = () => {
  exporting.value = true;
  try {
    const rows = results.value.map((row: any) => ({
      'ID':               row.OldConsumerId || '',
      'NAME':             row.CustomerName || '',
      'ADDRESS':          row.CustomerAddress || '',
      'MOBILE':           row.CustomerMobile || row.MobileNo || '',
      'CHANGED MOBILE':   row.ChangedMobileNo || '',
      'SECONDARY MOBILE': row.SecondaryMobileNo || '',
      'NOCS':             row.CustomerNOCS || '',
      'Install Dt':       row.InstallDate || '',
      'New Meter No.':    row.NewMeterNoOCR || '',
      'Latitude':         row.Latitude || '',
      'Longitude':        row.Longitude || '',
      'MDM Entry':        row.IsMDMEntry ? 'Yes' : 'No',
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'CMO Customer');
    XLSX.writeFile(wb, `cmo_customer_${new Date().toISOString().slice(0, 10)}.xlsx`);
  } finally {
    exporting.value = false;
  }
};
</script>
