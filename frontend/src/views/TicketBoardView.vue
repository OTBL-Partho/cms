<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-4 md:p-6 lg:p-8">

    <!-- Header -->
    <div class="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 rounded-3xl p-6 md:p-8 mb-6 shadow-2xl shadow-blue-200">
      <div class="absolute -top-8 -right-8 w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>
      <div class="absolute -bottom-8 -left-8 w-40 h-40 bg-violet-400/20 rounded-full blur-2xl"></div>
      <div class="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-3 mb-1">
            <div class="w-11 h-11 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
              <svg class="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
              </svg>
            </div>
            <h1 class="text-2xl md:text-3xl font-bold text-white">Kanban Board</h1>
          </div>
          <p class="text-blue-200 text-sm ml-14">Visualize and manage tickets with workflow stages</p>
        </div>
        <router-link to="/tickets" class="inline-flex items-center gap-2 px-4 py-2.5 bg-white/15 text-white font-semibold rounded-xl text-sm border border-white/30 hover:bg-white/25 hover:-translate-y-0.5 transition-all self-start md:self-auto">
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Back to List
        </router-link>
      </div>
    </div>

    <!-- Summary bar -->
    <div class="grid grid-cols-4 gap-3 mb-6">
      <div v-for="col in columns" :key="col.key"
        class="bg-white/80 backdrop-blur rounded-2xl px-4 py-3 border border-white/20 shadow-sm flex items-center gap-3">
        <div class="w-3 h-3 rounded-full flex-shrink-0" :class="col.dotColor"></div>
        <div>
          <p class="text-xs text-gray-400 font-medium">{{ col.title }}</p>
          <p class="text-lg font-bold" :class="col.textColor">{{ grouped[col.key]?.length || 0 }}</p>
        </div>
      </div>
    </div>

    <!-- Kanban Columns -->
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      <div v-for="col in columns" :key="col.key" class="flex flex-col min-h-0">

        <!-- Column Header -->
        <div :class="['flex items-center justify-between px-4 py-3 rounded-2xl mb-3', col.headerBg]">
          <div class="flex items-center gap-2">
            <div class="w-2.5 h-2.5 rounded-full" :class="col.dotColor"></div>
            <span class="font-bold text-sm" :class="col.headerText">{{ col.title }}</span>
          </div>
          <span class="text-xs font-bold px-2.5 py-1 rounded-full" :class="col.badgeBg">{{ grouped[col.key]?.length || 0 }}</span>
        </div>

        <!-- Cards -->
        <div class="space-y-3 overflow-y-auto max-h-[calc(100vh-340px)] pr-0.5">
          <div
            v-for="t in grouped[col.key] || []"
            :key="t.id"
            @click="openTicket(t.id)"
            class="bg-white/90 backdrop-blur rounded-2xl p-4 border border-gray-100 shadow-sm cursor-pointer hover:-translate-y-1 hover:shadow-lg hover:border-indigo-200 transition-all duration-200 group"
          >
            <!-- Card header -->
            <div class="flex items-start justify-between gap-2 mb-2">
              <span class="font-mono text-xs font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-lg">#{{ t.id }}</span>
              <span :class="[
                'text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide',
                t.priority?.toLowerCase() === 'low' ? 'bg-green-100 text-green-700' :
                t.priority?.toLowerCase() === 'medium' ? 'bg-amber-100 text-amber-700' :
                t.priority?.toLowerCase() === 'high' ? 'bg-red-100 text-red-700' :
                'bg-purple-100 text-purple-700'
              ]">{{ t.priority }}</span>
            </div>

            <!-- Title -->
            <p class="text-sm font-semibold text-gray-800 leading-snug mb-3 line-clamp-2 group-hover:text-indigo-700 transition-colors">{{ t.title }}</p>

            <!-- Meta -->
            <div class="flex items-center gap-3 text-xs text-gray-400 mb-3">
              <span class="flex items-center gap-1">
                <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
                {{ t.type || 'Task' }}
              </span>
              <span v-if="t.assigneeId" class="flex items-center gap-1">
                <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                ID: {{ t.assigneeId }}
              </span>
            </div>

            <!-- Move button -->
            <button
              v-if="col.next !== col.key"
              @click.stop="move(t, col.next)"
              :class="['w-full py-1.5 rounded-xl text-xs font-semibold border-2 transition-all', col.moveBtnClass]"
            >
              Move → {{ col.next }}
            </button>
          </div>

          <!-- Empty -->
          <div v-if="(grouped[col.key] || []).length === 0"
            class="bg-white/40 border-2 border-dashed border-gray-200 rounded-2xl p-8 flex flex-col items-center text-gray-300">
            <svg class="w-10 h-10 mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <line x1="9" y1="9" x2="15" y2="15"/><line x1="15" y1="9" x2="9" y2="15"/>
            </svg>
            <p class="text-sm font-medium">No tickets</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, computed } from 'vue';
import api from '../api';
import { useRouter } from 'vue-router';

type StatusKey = 'Open' | 'In Progress' | 'Resolved' | 'Closed';

const router = useRouter();

const state = reactive({ tickets: [] as any[] });

const columns = [
  {
    key: 'Open', title: 'Open', next: 'In Progress',
    dotColor: 'bg-blue-500', textColor: 'text-blue-600',
    headerBg: 'bg-blue-50 border border-blue-100',
    headerText: 'text-blue-700',
    badgeBg: 'bg-blue-100 text-blue-700',
    moveBtnClass: 'border-blue-200 text-blue-600 hover:bg-blue-500 hover:text-white hover:border-blue-500'
  },
  {
    key: 'In Progress', title: 'In Progress', next: 'Resolved',
    dotColor: 'bg-amber-500', textColor: 'text-amber-600',
    headerBg: 'bg-amber-50 border border-amber-100',
    headerText: 'text-amber-700',
    badgeBg: 'bg-amber-100 text-amber-700',
    moveBtnClass: 'border-amber-200 text-amber-600 hover:bg-amber-500 hover:text-white hover:border-amber-500'
  },
  {
    key: 'Resolved', title: 'Resolved', next: 'Closed',
    dotColor: 'bg-green-500', textColor: 'text-green-600',
    headerBg: 'bg-green-50 border border-green-100',
    headerText: 'text-green-700',
    badgeBg: 'bg-green-100 text-green-700',
    moveBtnClass: 'border-green-200 text-green-600 hover:bg-green-500 hover:text-white hover:border-green-500'
  },
  {
    key: 'Closed', title: 'Closed', next: 'Closed',
    dotColor: 'bg-gray-400', textColor: 'text-gray-500',
    headerBg: 'bg-gray-50 border border-gray-200',
    headerText: 'text-gray-600',
    badgeBg: 'bg-gray-100 text-gray-600',
    moveBtnClass: 'border-gray-200 text-gray-500 hover:bg-gray-400 hover:text-white hover:border-gray-400'
  },
] as { key: StatusKey, title: string, next: StatusKey, dotColor: string, textColor: string, headerBg: string, headerText: string, badgeBg: string, moveBtnClass: string }[];

const load = async () => {
  const res = await api.get('/tickets');
  state.tickets = res.data || [];
};

const grouped = computed<Record<StatusKey, any[]>>(() => {
  const g: any = { 'Open': [], 'In Progress': [], 'Resolved': [], 'Closed': [] };
  for (const t of state.tickets) {
    const s = (t.status as StatusKey) || 'Open';
    if (!g[s]) g['Open'].push(t); else g[s].push(t);
  }
  return g;
});

const move = async (ticket: any, toStatus: StatusKey) => {
  if (!ticket || ticket.status === toStatus) return;
  await api.put(`/tickets/${ticket.id}`, { ...ticket, status: toStatus });
  await load();
};

const openTicket = (id: number) => {
  router.push(`/tickets/${id}`);
};

onMounted(load);
</script>
