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
                <path d="M3 7v4a1 1 0 001 1h3M21 7v4a1 1 0 01-1 1h-3M10 12h4M10 16h4M12 8h.01"/>
              </svg>
            </div>
            <h1 class="text-2xl md:text-3xl font-bold text-white">Tickets</h1>
          </div>
          <p class="text-blue-200 text-sm ml-14">Manage and track all support tickets</p>
        </div>
        <div class="flex gap-3">
          <router-link to="/tickets/board" class="inline-flex items-center gap-2 px-4 py-2.5 bg-white/15 text-white font-semibold rounded-xl text-sm border border-white/30 hover:bg-white/25 hover:-translate-y-0.5 transition-all">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
            </svg>
            Board
          </router-link>
          <router-link to="/tickets/create" class="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-blue-700 font-semibold rounded-xl text-sm shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            New Ticket
          </router-link>
        </div>
      </div>
    </div>

    <!-- Stats row -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div class="bg-white/80 backdrop-blur rounded-2xl p-4 border border-white/20 shadow-sm">
        <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Total</p>
        <p class="text-2xl font-bold text-gray-800">{{ tickets.length }}</p>
      </div>
      <div class="bg-white/80 backdrop-blur rounded-2xl p-4 border border-blue-100 shadow-sm">
        <p class="text-xs font-semibold text-blue-400 uppercase tracking-wide mb-1">Open</p>
        <p class="text-2xl font-bold text-blue-600">{{ tickets.filter(t => t.status === 'Open').length }}</p>
      </div>
      <div class="bg-white/80 backdrop-blur rounded-2xl p-4 border border-amber-100 shadow-sm">
        <p class="text-xs font-semibold text-amber-400 uppercase tracking-wide mb-1">In Progress</p>
        <p class="text-2xl font-bold text-amber-600">{{ tickets.filter(t => t.status === 'In-Progress').length }}</p>
      </div>
      <div class="bg-white/80 backdrop-blur rounded-2xl p-4 border border-green-100 shadow-sm">
        <p class="text-xs font-semibold text-green-400 uppercase tracking-wide mb-1">Resolved</p>
        <p class="text-2xl font-bold text-green-600">{{ tickets.filter(t => t.status === 'Resolved').length }}</p>
      </div>
    </div>

    <!-- Search -->
    <div class="bg-white/80 backdrop-blur-lg rounded-2xl shadow border border-white/20 px-4 py-3 mb-6 flex items-center gap-3">
      <svg class="w-5 h-5 text-gray-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
      </svg>
      <input
        type="text"
        class="flex-1 bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400"
        placeholder="Search by title or ticket ID..."
        v-model="searchTerm"
      />
      <span v-if="filteredTickets.length !== tickets.length" class="text-xs text-gray-400">{{ filteredTickets.length }} results</span>
    </div>

    <!-- Table -->
    <div class="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full text-sm">
          <thead>
            <tr class="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
              <th class="px-5 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">ID</th>
              <th class="px-5 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Title</th>
              <th class="px-5 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
              <th class="px-5 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Priority</th>
              <th class="px-5 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Assignee</th>
              <th class="px-5 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="ticket in filteredTickets" :key="ticket.id" class="hover:bg-blue-50/40 transition-colors group">
              <td class="px-5 py-3.5">
                <span class="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">#{{ ticket.id }}</span>
              </td>
              <td class="px-5 py-3.5 max-w-xs">
                <span class="font-medium text-gray-800 truncate block" :title="ticket.title">{{ ticket.title }}</span>
              </td>
              <td class="px-5 py-3.5">
                <select
                  v-model="ticket.status"
                  @change="updateTicketStatus(ticket)"
                  :class="[
                    'text-xs font-bold px-3 py-1.5 rounded-full border-none outline-none cursor-pointer appearance-none pr-6',
                    ticket.status === 'Open' ? 'bg-blue-100 text-blue-700' :
                    ticket.status === 'In-Progress' ? 'bg-amber-100 text-amber-700' :
                    ticket.status === 'Resolved' ? 'bg-green-100 text-green-700' :
                    'bg-gray-100 text-gray-600'
                  ]"
                >
                  <option value="Open">Open</option>
                  <option value="In-Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                </select>
              </td>
              <td class="px-5 py-3.5">
                <span :class="[
                  'inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full',
                  ticket.priority?.toLowerCase() === 'low' ? 'bg-green-100 text-green-700' :
                  ticket.priority?.toLowerCase() === 'medium' ? 'bg-amber-100 text-amber-700' :
                  ticket.priority?.toLowerCase() === 'high' ? 'bg-red-100 text-red-700' :
                  'bg-purple-100 text-purple-700'
                ]">
                  <span class="w-1.5 h-1.5 rounded-full" :class="[
                    ticket.priority?.toLowerCase() === 'low' ? 'bg-green-500' :
                    ticket.priority?.toLowerCase() === 'medium' ? 'bg-amber-500' :
                    ticket.priority?.toLowerCase() === 'high' ? 'bg-red-500' : 'bg-purple-500'
                  ]"></span>
                  {{ ticket.priority }}
                </span>
              </td>
              <td class="px-5 py-3.5 text-gray-500 text-xs">
                {{ ticket.assignee?.fullName || ticket.assignee?.email || 'Unassigned' }}
              </td>
              <td class="px-5 py-3.5">
                <div class="flex gap-1.5 opacity-70 group-hover:opacity-100 transition-opacity">
                  <router-link :to="`/tickets/${ticket.id}`"
                    class="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-50 text-blue-500 hover:bg-blue-500 hover:text-white transition-colors"
                    title="View">
                    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                    </svg>
                  </router-link>
                  <router-link v-if="canEditOrDelete" :to="`/tickets/${ticket.id}/edit`"
                    class="w-8 h-8 flex items-center justify-center rounded-lg bg-amber-50 text-amber-500 hover:bg-amber-500 hover:text-white transition-colors"
                    title="Edit">
                    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </router-link>
                  <button v-if="canEditOrDelete" @click="deleteTicket(ticket.id)"
                    class="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 text-red-400 hover:bg-red-500 hover:text-white transition-colors"
                    title="Delete">
                    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="filteredTickets.length === 0">
              <td colspan="6" class="px-5 py-16 text-center text-gray-400">
                <svg class="w-12 h-12 mx-auto mb-3 text-gray-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M3 7v4a1 1 0 001 1h3M21 7v4a1 1 0 01-1 1h-3M10 12h4M10 16h4M12 8h.01"/>
                </svg>
                <p class="font-medium">No tickets found</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import apiClient from '../api';

interface Ticket {
  id: number;
  title: string;
  status: string;
  priority: string;
  assigneeId: number | null;
  assignee?: {
    id: number;
    fullName?: string;
    email: string;
  };
}

const tickets = ref<Ticket[]>([]);
const searchTerm = ref('');
const userRole = ref<string>('');

onMounted(async () => {
  try {
    const response = await apiClient.get('/tickets');
    tickets.value = response.data;

    // Get current user role
    const userResponse = await apiClient.get('/auth/me');
    userRole.value = userResponse.data.role;
  } catch (error) {
    console.error('Error getting tickets', error);
  }
});

const canEditOrDelete = computed(() => {
  return ['admin', 'super_admin', 'manager'].includes(userRole.value?.toLowerCase());
});

const filteredTickets = computed<Ticket[]>(() => {
  if (!searchTerm.value) {
    return tickets.value;
  }
  const lowerCaseSearchTerm = searchTerm.value.toLowerCase();
  return tickets.value.filter(ticket =>
    ticket.title.toLowerCase().includes(lowerCaseSearchTerm) ||
    ticket.id.toString().includes(lowerCaseSearchTerm)
  );
});

const updateTicketStatus = async (ticket: Ticket) => {
  try {
    await apiClient.patch(`/tickets/${ticket.id}`, {
      status: ticket.status
    });
    console.log('Status updated successfully');
  } catch (error) {
    console.error('Error updating ticket status', error);
    const response = await apiClient.get('/tickets');
    tickets.value = response.data;
  }
};

const deleteTicket = async (ticketId: number) => {
  if (!confirm('Are you sure you want to delete this ticket?')) {
    return;
  }

  try {
    await apiClient.delete(`/tickets/${ticketId}`);
    tickets.value = tickets.value.filter(t => t.id !== ticketId);
    console.log('Ticket deleted successfully');
  } catch (error) {
    console.error('Error deleting ticket', error);
    alert('Failed to delete ticket');
  }
};
</script>
