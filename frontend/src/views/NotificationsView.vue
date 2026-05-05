<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 via-violet-50 to-purple-50 p-4 md:p-6 lg:p-8">

    <!-- Header -->
    <div class="relative overflow-hidden bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 rounded-3xl p-6 md:p-8 mb-6 shadow-2xl shadow-violet-200">
      <!-- Decorative blobs -->
      <div class="absolute -top-8 -right-8 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
      <div class="absolute -bottom-8 -left-8 w-40 h-40 bg-indigo-400/20 rounded-full blur-2xl"></div>

      <div class="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
        <!-- Title area -->
        <div>
          <div class="flex items-center gap-3 mb-2">
            <div class="w-12 h-12 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
              <svg class="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h1 class="text-2xl md:text-3xl font-bold text-white">Notifications</h1>
                <span v-if="unreadCount > 0" class="inline-flex items-center justify-center min-w-[26px] h-[26px] px-1.5 bg-white text-violet-700 text-xs font-bold rounded-full shadow-lg animate-pulse">
                  {{ unreadCount }}
                </span>
              </div>
              <p class="text-violet-200 text-sm mt-0.5">Stay updated with your tickets and activities</p>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex gap-3 flex-wrap">
          <button
            @click="markAllAsRead"
            :disabled="unreadCount === 0"
            class="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-violet-700 font-semibold rounded-xl text-sm shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          >
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            Mark All Read
          </button>
          <button
            @click="clearReadNotifications"
            class="inline-flex items-center gap-2 px-4 py-2.5 bg-white/15 text-white font-semibold rounded-xl text-sm border border-white/30 hover:bg-white/25 hover:-translate-y-0.5 transition-all"
          >
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            Clear Read
          </button>
        </div>
      </div>
    </div>

    <!-- Stats Bar -->
    <div class="grid grid-cols-3 md:grid-cols-6 gap-3 mb-6">
      <button
        v-for="tab in filterTabs" :key="tab.key"
        @click="activeFilter = tab.key"
        :class="[
          'relative flex flex-col items-center justify-center gap-1 p-3 rounded-2xl border-2 text-xs font-semibold transition-all duration-200',
          activeFilter === tab.key
            ? 'bg-white border-violet-500 text-violet-700 shadow-lg shadow-violet-100 -translate-y-0.5'
            : 'bg-white/70 border-transparent text-gray-500 hover:bg-white hover:border-violet-200 hover:text-violet-600'
        ]"
      >
        <span class="text-lg" v-html="tab.emoji"></span>
        <span>{{ tab.label }}</span>
        <span
          v-if="tab.key === 'unread' && unreadCount > 0"
          class="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center"
        >{{ unreadCount }}</span>
      </button>
    </div>

    <!-- Search -->
    <div class="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 px-4 py-3 mb-6 flex items-center gap-3">
      <svg class="w-5 h-5 text-gray-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
      </svg>
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search notifications by title or message..."
        class="flex-1 bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400"
      />
      <button
        v-if="searchQuery"
        @click="searchQuery = ''"
        class="w-6 h-6 flex items-center justify-center rounded-full bg-gray-100 text-gray-400 hover:bg-gray-200 transition-colors"
      >
        <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="space-y-3">
      <div v-for="i in 5" :key="i" class="bg-white/80 backdrop-blur rounded-2xl p-5 flex gap-4 animate-pulse">
        <div class="w-12 h-12 bg-gray-200 rounded-2xl flex-shrink-0"></div>
        <div class="flex-1 space-y-2">
          <div class="h-4 bg-gray-200 rounded-lg w-3/4"></div>
          <div class="h-3 bg-gray-100 rounded-lg w-full"></div>
          <div class="h-3 bg-gray-100 rounded-lg w-2/3"></div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredNotifications.length === 0" class="bg-white/80 backdrop-blur-lg rounded-3xl shadow-lg border border-white/20 py-20 flex flex-col items-center">
      <div class="w-20 h-20 bg-violet-50 rounded-3xl flex items-center justify-center mb-4">
        <svg class="w-10 h-10 text-violet-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
      </div>
      <h3 class="text-gray-700 font-semibold text-lg mb-1">No notifications</h3>
      <p class="text-gray-400 text-sm">{{ activeFilter !== 'all' ? 'Try a different filter or clear your search' : "You're all caught up!" }}</p>
    </div>

    <!-- Notification Groups -->
    <div v-else class="space-y-8">
      <div v-for="group in groupedNotifications" :key="group.label">
        <!-- Group Label -->
        <div class="flex items-center gap-3 mb-3">
          <span class="text-xs font-bold uppercase tracking-widest text-gray-400">{{ group.label }}</span>
          <div class="flex-1 h-px bg-gray-200/70"></div>
          <span class="text-xs text-gray-400 font-medium">{{ group.notifications.length }} item{{ group.notifications.length !== 1 ? 's' : '' }}</span>
        </div>

        <!-- Cards -->
        <div class="space-y-2.5">
          <div
            v-for="notif in group.notifications"
            :key="notif.id"
            @click="handleNotificationClick(notif)"
            :class="[
              'group relative flex items-start gap-4 p-4 md:p-5 rounded-2xl border cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg',
              notif.isRead
                ? 'bg-white/70 backdrop-blur border-gray-100 hover:border-violet-200 hover:shadow-violet-100'
                : 'bg-white backdrop-blur border-violet-200 shadow-md shadow-violet-100/50'
            ]"
          >
            <!-- Unread left bar -->
            <div
              v-if="!notif.isRead"
              class="absolute left-0 top-4 bottom-4 w-1 rounded-r-full"
              :style="{ backgroundColor: notif.color || '#7c3aed' }"
            ></div>

            <!-- Icon -->
            <div
              class="w-11 h-11 md:w-12 md:h-12 flex-shrink-0 rounded-2xl flex items-center justify-center shadow-sm"
              :style="{ background: `linear-gradient(135deg, ${notif.color || '#7c3aed'}, ${adjustColor(notif.color || '#7c3aed')})` }"
            >
              <div v-html="getIcon(notif.icon)"></div>
            </div>

            <!-- Content -->
            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between gap-2 mb-1">
                <h3 :class="['text-sm font-semibold leading-tight', notif.isRead ? 'text-gray-600' : 'text-gray-900']">
                  {{ notif.title }}
                  <span
                    v-if="!notif.isRead"
                    class="inline-block ml-1.5 w-2 h-2 bg-violet-500 rounded-full align-middle"
                  ></span>
                </h3>
                <span class="text-xs text-gray-400 whitespace-nowrap flex-shrink-0 mt-0.5">{{ formatRelativeTime(notif.createdAt) }}</span>
              </div>
              <p class="text-xs text-gray-500 leading-relaxed line-clamp-2">{{ notif.message }}</p>
              <div class="flex items-center gap-2 mt-2" v-if="notif.priority === 'high' || notif.priority === 'urgent'">
                <span
                  :class="[
                    'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide',
                    notif.priority === 'urgent' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                  ]"
                >
                  <span class="w-1.5 h-1.5 rounded-full" :class="notif.priority === 'urgent' ? 'bg-red-500' : 'bg-amber-500'"></span>
                  {{ notif.priority }}
                </span>
              </div>
            </div>

            <!-- Action Buttons (hidden, appear on hover) -->
            <div class="flex-shrink-0 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <button
                v-if="!notif.isRead"
                @click.stop="markAsRead(notif.id)"
                title="Mark as read"
                class="w-8 h-8 flex items-center justify-center rounded-xl bg-violet-50 text-violet-500 hover:bg-violet-500 hover:text-white transition-colors"
              >
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              </button>
              <button
                @click.stop="deleteNotification(notif.id)"
                title="Delete"
                class="w-8 h-8 flex items-center justify-center rounded-xl bg-red-50 text-red-400 hover:bg-red-500 hover:text-white transition-colors"
              >
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import api from '../api';

// Filter tabs config
const filterTabs = [
  { key: 'all', label: 'All', emoji: '🔔' },
  { key: 'unread', label: 'Unread', emoji: '✉️' },
  { key: 'ticket', label: 'Tickets', emoji: '🎫' },
  { key: 'comment', label: 'Comments', emoji: '💬' },
  { key: 'assignment', label: 'Assign', emoji: '👤' },
  { key: 'status', label: 'Status', emoji: '📊' },
];

// Slightly darken a hex color for gradient effect
const adjustColor = (hex: string): string => {
  try {
    const n = parseInt(hex.replace('#', ''), 16);
    const r = Math.max(0, (n >> 16) - 30);
    const g = Math.max(0, ((n >> 8) & 0xff) - 30);
    const b = Math.max(0, (n & 0xff) - 30);
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
  } catch {
    return hex;
  }
};

// Icons as SVG strings
const getIcon = (iconName: string): string => {
  const icons: Record<string, string> = {
    ticket: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
      <path d="M3 7v4a1 1 0 001 1h3"/>
      <path d="M21 7v4a1 1 0 01-1 1h-3"/>
      <path d="M10 12h4"/>
      <path d="M10 16h4"/>
      <path d="M12 8h.01"/>
    </svg>`,
    'user-switch': `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
      <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
      <circle cx="8.5" cy="7" r="4"/>
      <polyline points="17 11 19 13 23 9"/>
    </svg>`,
    refresh: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
      <polyline points="23 4 23 10 17 10"/>
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
    </svg>`,
    alert: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="12"/>
      <line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>`,
    message: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
    </svg>`,
    at: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
      <circle cx="12" cy="12" r="4"/>
      <path d="M16 8v5a3 3 0 006 0v-1a10 10 0 10-3.92 7.94"/>
    </svg>`,
    clock: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>`,
    warning: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/>
      <line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>`,
    users: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 00-3-3.87"/>
      <path d="M16 3.13a4 4 0 010 7.75"/>
    </svg>`,
    folder: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
      <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>
    </svg>`,
    'plus-circle': `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="16"/>
      <line x1="8" y1="12" x2="16" y2="12"/>
    </svg>`,
    bell: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 01-3.46 0"/>
    </svg>`
  };
  return icons[iconName] || icons.bell;
};

const router = useRouter();
const notifications = ref<any[]>([]);
const loading = ref(false);
const activeFilter = ref('all');
const searchQuery = ref('');
const unreadCount = ref(0);
let pollingInterval: any = null;

// Filtered notifications
const filteredNotifications = computed(() => {
  let filtered = notifications.value;

  // Filter by category
  if (activeFilter.value !== 'all') {
    if (activeFilter.value === 'unread') {
      filtered = filtered.filter(n => !n.isRead);
    } else {
      filtered = filtered.filter(n => n.category === activeFilter.value);
    }
  }

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(n =>
      n.title.toLowerCase().includes(query) ||
      n.message.toLowerCase().includes(query)
    );
  }

  return filtered;
});

// Group notifications by date
const groupedNotifications = computed(() => {
  const groups: Record<string, any[]> = {
    today: [],
    yesterday: [],
    thisWeek: [],
    older: []
  };

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  filteredNotifications.value.forEach(notif => {
    const notifDate = new Date(notif.createdAt);
    const notifDay = new Date(notifDate.getFullYear(), notifDate.getMonth(), notifDate.getDate());

    if (notifDay.getTime() === today.getTime()) {
      groups.today.push(notif);
    } else if (notifDay.getTime() === yesterday.getTime()) {
      groups.yesterday.push(notif);
    } else if (notifDate >= weekAgo) {
      groups.thisWeek.push(notif);
    } else {
      groups.older.push(notif);
    }
  });

  const result = [];
  if (groups.today.length > 0) result.push({ label: 'Today', notifications: groups.today });
  if (groups.yesterday.length > 0) result.push({ label: 'Yesterday', notifications: groups.yesterday });
  if (groups.thisWeek.length > 0) result.push({ label: 'This Week', notifications: groups.thisWeek });
  if (groups.older.length > 0) result.push({ label: 'Older', notifications: groups.older });

  return result;
});

// Fetch notifications
const fetchNotifications = async () => {
  try {
    loading.value = true;
    const res = await api.get('/notifications');
    notifications.value = res.data;
  } catch (error) {
    console.error('Error fetching notifications:', error);
  } finally {
    loading.value = false;
  }
};

// Fetch unread count
const fetchUnreadCount = async () => {
  try {
    const res = await api.get('/notifications/unread/count');
    unreadCount.value = res.data.count;
  } catch (error) {
    console.error('Error fetching unread count:', error);
  }
};

// Mark single notification as read
const markAsRead = async (id: number) => {
  try {
    await api.put(`/notifications/${id}/read`);
    const notif = notifications.value.find(n => n.id === id);
    if (notif) {
      notif.isRead = true;
      notif.readAt = new Date();
    }
    fetchUnreadCount();
  } catch (error) {
    console.error('Error marking notification as read:', error);
  }
};

// Mark all notifications as read
const markAllAsRead = async () => {
  try {
    await api.put('/notifications/mark-all-read');
    notifications.value.forEach(n => {
      n.isRead = true;
      n.readAt = new Date();
    });
    unreadCount.value = 0;
  } catch (error) {
    console.error('Error marking all as read:', error);
  }
};

// Delete notification
const deleteNotification = async (id: number) => {
  try {
    await api.delete(`/notifications/${id}`);
    notifications.value = notifications.value.filter(n => n.id !== id);
    fetchUnreadCount();
  } catch (error) {
    console.error('Error deleting notification:', error);
  }
};

// Clear read notifications
const clearReadNotifications = async () => {
  try {
    await api.delete('/notifications/clear-all');
    notifications.value = notifications.value.filter(n => !n.isRead);
  } catch (error) {
    console.error('Error clearing notifications:', error);
  }
};

// Handle notification click
const handleNotificationClick = async (notif: any) => {
  // Mark as read if unread
  if (!notif.isRead) {
    await markAsRead(notif.id);
  }

  // Navigate to action URL if available
  if (notif.actionUrl) {
    router.push(notif.actionUrl);
  }
};

// Format relative time
const formatRelativeTime = (date: string): string => {
  const now = new Date();
  const then = new Date(date);
  const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);

  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return then.toLocaleDateString();
};

// Start polling
const startPolling = () => {
  pollingInterval = setInterval(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, 30000); // Poll every 30 seconds
};

// Stop polling
const stopPolling = () => {
  if (pollingInterval) {
    clearInterval(pollingInterval);
  }
};

// Lifecycle
onMounted(() => {
  fetchNotifications();
  fetchUnreadCount();
  startPolling();
});

onUnmounted(() => {
  stopPolling();
});
</script>
