<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 via-teal-50 to-cyan-50 p-4 md:p-6 lg:p-8">
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-4xl font-bold bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent mb-1">
        Meter Swap
      </h1>
      <p class="text-gray-500 text-sm">View and manage meter swap records from CMO</p>
    </div>

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
            placeholder="Consumer ID, customer name, meter..."
            class="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-teal-400 focus:outline-none"
          />
        </div>
        <!-- Status -->
        <div class="min-w-[150px]">
          <label class="block text-xs font-medium text-gray-600 mb-1">Status</label>
          <select
            v-model="filters.status"
            @change="fetchSwaps"
            class="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-teal-400 focus:outline-none bg-white"
          >
            <option value="">All Status</option>
            <option value="Open">Open</option>
            <option value="InProcess">In Process</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>
        <!-- Clear -->
        <button @click="clearFilters" class="px-4 py-2 border border-gray-300 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors">Clear</button>
        <div class="flex-1"></div>
        <!-- Refresh -->
        <button @click="refresh" :disabled="loading" class="px-4 py-2 border border-gray-300 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-2 disabled:opacity-50">
          <svg class="w-4 h-4" :class="{ 'animate-spin': loading }" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
          Refresh
        </button>
      </div>
    </div>

    <!-- Record count -->
    <div class="text-sm text-gray-500 mb-3" v-if="pagination">
      Showing {{ swaps.length }} of {{ pagination.total }} records — Page {{ pagination.page }} of {{ pagination.totalPages }}
    </div>

    <!-- Loading -->
    <div v-if="loading" class="bg-white/80 rounded-2xl shadow p-12 flex flex-col items-center">
      <div class="animate-spin rounded-full h-10 w-10 border-4 border-teal-200 border-t-teal-600 mb-3"></div>
      <p class="text-gray-400 text-sm">Loading swap records...</p>
    </div>

    <!-- Empty -->
    <div v-else-if="!loading && swaps.length === 0" class="bg-white/80 rounded-2xl shadow p-12 flex flex-col items-center">
      <svg class="w-14 h-14 text-gray-200 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/></svg>
      <p class="text-gray-400 font-medium">No swap records found</p>
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
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">NOCS</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">MDM Meter</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actual Meter</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Address</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Install Date</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Remarks</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-100">
            <tr v-for="swap in swaps" :key="swap.Id" class="hover:bg-teal-50/40 transition-colors">
              <td class="px-4 py-3 font-mono text-xs font-medium text-gray-800">{{ swap.OldConsumerId || '—' }}</td>
              <td class="px-4 py-3 text-gray-700 max-w-[180px] truncate" :title="swap.CustomerName">{{ swap.CustomerName || '—' }}</td>
              <td class="px-4 py-3 text-gray-600 whitespace-nowrap">{{ swap.Nocs || '—' }}</td>
              <td class="px-4 py-3 font-mono text-xs text-gray-600 whitespace-nowrap">{{ swap.MdmMeterNumber || '—' }}</td>
              <td class="px-4 py-3 font-mono text-xs text-gray-600 whitespace-nowrap">{{ swap.ActualMeterNumber || '—' }}</td>
              <td class="px-4 py-3 text-gray-500 max-w-[180px] truncate text-xs" :title="swap.Address">{{ swap.Address || '—' }}</td>
              <td class="px-4 py-3 text-gray-500 whitespace-nowrap">{{ swap.InstallDate || '—' }}</td>
              <td class="px-4 py-3 text-gray-500 max-w-[200px] truncate text-xs" :title="swap.Remarks">{{ swap.Remarks || '—' }}</td>
              <td class="px-4 py-3 whitespace-nowrap">
                <span :class="statusClass(swap.Status)" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold">
                  {{ swap.Status }}
                </span>
              </td>
              <td class="px-4 py-3 whitespace-nowrap">
                <div class="flex gap-2">
                  <button
                    v-if="swap.Status === 'Open'"
                    @click="handleUpdateStatus(swap, 'InProcess')"
                    :disabled="updatingId === swap.Id"
                    class="px-2.5 py-1 bg-purple-500 text-white rounded-lg text-xs font-semibold hover:bg-purple-600 disabled:opacity-50 transition-colors"
                  >{{ updatingId === swap.Id ? '...' : 'In Process' }}</button>
                  <button
                    v-if="swap.Status === 'InProcess'"
                    @click="handleUpdateStatus(swap, 'Resolved')"
                    :disabled="updatingId === swap.Id"
                    class="px-2.5 py-1 bg-green-500 text-white rounded-lg text-xs font-semibold hover:bg-green-600 disabled:opacity-50 transition-colors"
                  >{{ updatingId === swap.Id ? '...' : 'Mark Done' }}</button>
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
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getCMOMeterSwaps, getCMOMeterSwapStats, updateCMOMeterSwapStatus } from '../api';

const swaps = ref<any[]>([]);
const stats = ref<{ open: number; inProcess: number; resolved: number; total: number } | null>(null);
const pagination = ref<{ page: number; limit: number; total: number; totalPages: number } | null>(null);
const loading = ref(false);
const updatingId = ref<number | null>(null);

const filters = ref({ search: '', status: '', page: 1, limit: 20 });

let debounceTimer: ReturnType<typeof setTimeout> | null = null;
const debouncedFetch = () => {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => { filters.value.page = 1; fetchSwaps(); }, 400);
};

const fetchSwaps = async () => {
  loading.value = true;
  try {
    const params: Record<string, any> = { page: filters.value.page, limit: filters.value.limit };
    if (filters.value.search) params.search = filters.value.search;
    if (filters.value.status) params.status = filters.value.status;
    const res = await getCMOMeterSwaps(params);
    swaps.value = res.data?.data || [];
    pagination.value = res.data?.pagination || null;
  } catch {
    swaps.value = [];
  } finally {
    loading.value = false;
  }
};

const fetchStats = async () => {
  try {
    const res = await getCMOMeterSwapStats();
    stats.value = res.data?.data || null;
  } catch {}
};

const refresh = () => { fetchSwaps(); fetchStats(); };
const clearFilters = () => { filters.value = { search: '', status: '', page: 1, limit: 20 }; fetchSwaps(); };
const goToPage = (p: number) => { if (!pagination.value) return; filters.value.page = p; fetchSwaps(); };

const handleUpdateStatus = async (swap: any, status: string) => {
  updatingId.value = swap.Id;
  try {
    await updateCMOMeterSwapStatus(swap.Id, status);
    refresh();
  } catch (e: any) {
    alert(e.response?.data?.message || 'Failed to update status');
  } finally {
    updatingId.value = null;
  }
};

const statusClass = (status: string) => {
  if (status === 'Open') return 'bg-yellow-100 text-yellow-800';
  if (status === 'InProcess') return 'bg-purple-100 text-purple-800';
  if (status === 'Resolved') return 'bg-green-100 text-green-800';
  return 'bg-gray-100 text-gray-600';
};

onMounted(() => { fetchSwaps(); fetchStats(); });
</script>
