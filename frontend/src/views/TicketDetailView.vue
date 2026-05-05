<template>
  <div class="min-h-screen" style="background: linear-gradient(135deg, #f0f4ff 0%, #f8f0ff 50%, #f0f9ff 100%);">

    <!-- Loading -->
    <div v-if="!ticket" class="flex flex-col items-center justify-center min-h-[70vh] gap-5">
      <div class="w-14 h-14 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
      <div class="text-center">
        <p class="text-gray-700 font-semibold">Loading ticket…</p>
        <p class="text-gray-400 text-sm mt-1">Please wait while we fetch the details</p>
      </div>
    </div>

    <div v-else>

      <!-- ══ HERO HEADER ══ -->
      <div class="relative overflow-hidden" style="background: linear-gradient(135deg, #1e3a8a 0%, #4338ca 40%, #7c3aed 100%);">
        <!-- Decorative blobs -->
        <div class="absolute -top-10 -right-10 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
        <div class="absolute -bottom-10 -left-10 w-56 h-56 bg-purple-400/10 rounded-full blur-3xl pointer-events-none"></div>
        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-32 bg-indigo-400/10 rounded-full blur-2xl pointer-events-none"></div>

        <div class="relative px-6 pt-5 pb-6">
          <!-- Breadcrumb -->
          <nav class="flex items-center gap-2 mb-4">
            <router-link to="/tickets" class="flex items-center gap-1.5 text-indigo-200 hover:text-white transition-colors text-xs font-medium">
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
              </svg>
              All Tickets
            </router-link>
            <svg class="w-3 h-3 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
            <span class="text-white/60 text-xs truncate max-w-[260px]">{{ ticket.title }}</span>
          </nav>

          <!-- Title row -->
          <div class="flex items-start justify-between gap-4">
            <div class="flex items-start gap-4 min-w-0 flex-1">
              <!-- Ticket ID badge -->
              <div class="flex-shrink-0 mt-0.5">
                <span class="inline-flex items-center px-2.5 py-1 bg-white/15 backdrop-blur border border-white/25 text-white font-mono font-bold text-sm rounded-lg">
                  #{{ ticket.id }}
                </span>
              </div>
              <div class="min-w-0">
                <h1 class="text-2xl md:text-3xl font-extrabold text-white leading-tight tracking-tight">{{ ticket.title }}</h1>
                <!-- Meta row under title -->
                <div class="flex flex-wrap items-center gap-3 mt-2">
                  <!-- Status chip -->
                  <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold backdrop-blur border" :class="{
                    'bg-blue-400/20 border-blue-300/40 text-blue-100': ticket.status === 'Open',
                    'bg-amber-400/20 border-amber-300/40 text-amber-100': ticket.status === 'In Progress',
                    'bg-green-400/20 border-green-300/40 text-green-100': ticket.status === 'Resolved',
                    'bg-gray-400/20 border-gray-300/40 text-gray-200': ticket.status === 'Closed'
                  }">
                    <span class="w-1.5 h-1.5 rounded-full animate-pulse" :class="{
                      'bg-blue-300': ticket.status === 'Open',
                      'bg-amber-300': ticket.status === 'In Progress',
                      'bg-green-300': ticket.status === 'Resolved',
                      'bg-gray-400': ticket.status === 'Closed'
                    }"></span>
                    {{ ticket.status }}
                  </span>
                  <!-- Priority chip -->
                  <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/10 border border-white/20 text-white/90">
                    <svg class="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L4 14h16L12 2z"/></svg>
                    {{ ticket.priority || 'Normal' }}
                  </span>
                  <!-- Type chip -->
                  <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 border border-white/20 text-white/80">
                    {{ ticket.type || 'Task' }}
                  </span>
                  <!-- Created -->
                  <span class="flex items-center gap-1 text-xs text-indigo-200">
                    <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    {{ formatDate(ticket.createdAt) }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Header actions -->
            <div class="flex items-center gap-2 flex-shrink-0 flex-wrap justify-end mt-1">
              <ExportOptions :ticketId="ticket.id" />
              <router-link to="/tickets"
                class="inline-flex items-center gap-1.5 px-4 py-2 bg-white/15 hover:bg-white/25 border border-white/25 text-white text-sm font-semibold rounded-xl transition-all hover:-translate-y-0.5">
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                Back
              </router-link>
            </div>
          </div>
        </div>

        <!-- Status Workflow - bottom of header -->
        <div class="relative border-t border-white/10 bg-black/10 backdrop-blur-sm px-6 py-3">
          <StatusWorkflow
            :ticket="ticket"
            :canChangeStatus="canChangeStatus"
            @statusChanged="handleStatusChange"
          />
        </div>
      </div>

      <!-- ══ 3-COLUMN BODY ══ -->
      <div class="flex">

        <!-- LEFT: Properties Sidebar -->
        <div class="w-60 xl:w-68 flex-shrink-0 border-r border-indigo-100/80 bg-white/70 backdrop-blur-sm sticky top-0 self-start overflow-y-auto" style="max-height: 100vh; width: 240px;">
          <div class="p-4 space-y-1">

            <!-- Section: Details -->
            <div class="flex items-center gap-2 py-2 mb-1">
              <div class="w-5 h-5 rounded-md bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                <svg class="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="3"/><path d="M12 2v3m0 14v3M2 12h3m14 0h3"/></svg>
              </div>
              <span class="text-xs font-bold text-gray-700 uppercase tracking-wider">Details</span>
            </div>

            <!-- Status -->
            <div class="rounded-xl p-3 bg-white border border-gray-100 shadow-sm hover:border-indigo-200 transition-colors">
              <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Status</p>
              <span class="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg border" :class="{
                'bg-blue-50 text-blue-700 border-blue-200': ticket.status === 'Open',
                'bg-amber-50 text-amber-700 border-amber-200': ticket.status === 'In Progress',
                'bg-green-50 text-green-700 border-green-200': ticket.status === 'Resolved',
                'bg-gray-50 text-gray-500 border-gray-200': ticket.status === 'Closed'
              }">
                <span class="w-2 h-2 rounded-full" :class="{
                  'bg-blue-400': ticket.status === 'Open',
                  'bg-amber-400 animate-pulse': ticket.status === 'In Progress',
                  'bg-green-400': ticket.status === 'Resolved',
                  'bg-gray-300': ticket.status === 'Closed'
                }"></span>
                {{ ticket.status }}
              </span>
            </div>

            <!-- Priority -->
            <div class="rounded-xl p-3 bg-white border border-gray-100 shadow-sm hover:border-indigo-200 transition-colors">
              <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Priority</p>
              <span class="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg border" :class="{
                'bg-emerald-50 text-emerald-700 border-emerald-200': ticket.priority?.toLowerCase() === 'low',
                'bg-amber-50 text-amber-700 border-amber-200': ticket.priority?.toLowerCase() === 'medium',
                'bg-red-50 text-red-700 border-red-200': ticket.priority?.toLowerCase() === 'high',
                'bg-purple-50 text-purple-700 border-purple-200': !['low','medium','high'].includes(ticket.priority?.toLowerCase() || '')
              }">
                <svg class="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L4 14h16L12 2z"/></svg>
                {{ ticket.priority || 'Normal' }}
              </span>
            </div>

            <!-- Type -->
            <div class="rounded-xl p-3 bg-white border border-gray-100 shadow-sm hover:border-indigo-200 transition-colors">
              <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Type</p>
              <span class="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200">
                <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
                {{ ticket.type || 'Task' }}
              </span>
            </div>

            <!-- Severity -->
            <div v-if="ticket.severity" class="rounded-xl p-3 bg-white border border-gray-100 shadow-sm hover:border-indigo-200 transition-colors">
              <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Severity</p>
              <span class="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-rose-50 text-rose-700 border border-rose-200">
                {{ ticket.severity }}
              </span>
            </div>

            <!-- Divider: People -->
            <div class="flex items-center gap-2 py-2 pt-3 mb-1">
              <div class="w-5 h-5 rounded-md bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center flex-shrink-0">
                <svg class="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
              </div>
              <span class="text-xs font-bold text-gray-700 uppercase tracking-wider">People</span>
            </div>

            <!-- Assignee -->
            <div class="rounded-xl p-3 bg-white border border-gray-100 shadow-sm hover:border-indigo-200 transition-colors">
              <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Assignee</p>
              <div class="flex items-center gap-2">
                <div class="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0 shadow-sm">
                  {{ (ticket.assignee?.fullName || ticket.assignee?.email || 'U').charAt(0).toUpperCase() }}
                </div>
                <div class="min-w-0">
                  <p class="text-xs font-semibold text-gray-800 truncate">{{ ticket.assignee?.fullName || 'Unassigned' }}</p>
                  <p v-if="ticket.assignee?.email" class="text-[10px] text-gray-400 truncate">{{ ticket.assignee.email }}</p>
                </div>
              </div>
            </div>

            <!-- Reporter -->
            <div class="rounded-xl p-3 bg-white border border-gray-100 shadow-sm hover:border-indigo-200 transition-colors">
              <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Reporter</p>
              <div class="flex items-center gap-2">
                <div class="w-7 h-7 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0 shadow-sm">
                  {{ (ticket.reporter?.fullName || ticket.reporter?.email || '?').charAt(0).toUpperCase() }}
                </div>
                <div class="min-w-0">
                  <p class="text-xs font-semibold text-gray-800 truncate">{{ ticket.reporter?.fullName || 'Unknown' }}</p>
                  <p v-if="ticket.reporter?.email" class="text-[10px] text-gray-400 truncate">{{ ticket.reporter.email }}</p>
                </div>
              </div>
            </div>

            <!-- Divider: Project -->
            <div class="flex items-center gap-2 py-2 pt-3 mb-1">
              <div class="w-5 h-5 rounded-md bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                <svg class="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M4 4h7l2 2h7a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2z"/>
                </svg>
              </div>
              <span class="text-xs font-bold text-gray-700 uppercase tracking-wider">Project</span>
            </div>

            <div class="rounded-xl p-3 bg-white border border-gray-100 shadow-sm hover:border-indigo-200 transition-colors">
              <p class="text-xs font-semibold text-gray-800">{{ ticket.project?.name || 'General' }}</p>
              <p v-if="ticket.project?.description" class="text-[10px] text-gray-400 mt-0.5 truncate">{{ ticket.project.description }}</p>
            </div>

            <!-- Timestamps -->
            <div class="flex items-center gap-2 py-2 pt-3 mb-1">
              <div class="w-5 h-5 rounded-md bg-gradient-to-br from-slate-500 to-gray-600 flex items-center justify-center flex-shrink-0">
                <svg class="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </div>
              <span class="text-xs font-bold text-gray-700 uppercase tracking-wider">Timeline</span>
            </div>

            <div class="rounded-xl p-3 bg-white border border-gray-100 shadow-sm space-y-2">
              <div>
                <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Created</p>
                <p class="text-xs text-gray-700 font-medium mt-0.5">{{ formatDate(ticket.createdAt) }}</p>
              </div>
              <div v-if="ticket.updatedAt" class="pt-2 border-t border-gray-50">
                <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Last Updated</p>
                <p class="text-xs text-gray-700 font-medium mt-0.5">{{ formatDate(ticket.updatedAt) }}</p>
              </div>
            </div>

            <!-- Team Project Panel -->
            <div class="pt-3 border-t border-gray-100 mt-2">
              <TeamProjectPanel
                :ticket="ticket"
                :canReassign="canReassign"
                @reassigned="handleReassigned"
              />
            </div>

            <!-- Quick Actions -->
            <div class="pt-3 border-t border-gray-100">
              <QuickActions
                :ticket="ticket"
                @actionComplete="handleQuickAction"
              />
            </div>

          </div>
        </div>

        <!-- CENTER: Main Content -->
        <div class="flex-1 min-w-0 p-5 md:p-6">

          <!-- Tabs -->
          <div class="flex items-center gap-0 mb-6 border-b border-gray-200">
            <button @click="activeTab = 'description'"
              :class="activeTab === 'description'
                ? 'border-b-2 border-indigo-600 text-indigo-700 font-bold'
                : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 font-medium'"
              class="flex items-center gap-2 px-5 py-3 text-sm transition-all -mb-px">
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                <polyline points="14,2 14,8 20,8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
              Description
            </button>
            <button @click="activeTab = 'comments'"
              :class="activeTab === 'comments'
                ? 'border-b-2 border-indigo-600 text-indigo-700 font-bold'
                : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 font-medium'"
              class="flex items-center gap-2 px-5 py-3 text-sm transition-all -mb-px">
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
              </svg>
              Comments
              <span v-if="comments.length > 0"
                class="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-bold"
                :class="activeTab === 'comments' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'">
                {{ comments.length }}
              </span>
            </button>
          </div>

          <!-- ─ DESCRIPTION TAB ─ -->
          <div v-show="activeTab === 'description'" class="max-w-3xl space-y-5">

            <div class="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div class="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-indigo-50/60 to-purple-50/40">
                <div class="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                  <svg class="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                    <polyline points="14,2 14,8 20,8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                  </svg>
                </div>
                <div>
                  <h2 class="text-sm font-bold text-gray-800">Description</h2>
                  <p class="text-[11px] text-gray-400">Ticket details and context</p>
                </div>
              </div>
              <div class="p-6 description-body" v-html="ticket.description || '<p class=\'no-desc\'>No description has been provided for this ticket.</p>'"></div>
            </div>

            <!-- Attachments -->
            <div v-if="ticket.attachments && ticket.attachments.length > 0" class="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div class="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-teal-50/60 to-emerald-50/40">
                <div class="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center flex-shrink-0">
                  <svg class="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/>
                  </svg>
                </div>
                <div>
                  <h3 class="text-sm font-bold text-gray-800">Attachments</h3>
                  <p class="text-[11px] text-gray-400">{{ ticket.attachments.length }} file{{ ticket.attachments.length !== 1 ? 's' : '' }} attached</p>
                </div>
              </div>
              <div class="p-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <a v-for="attachment in ticket.attachments" :key="attachment.id"
                  :href="getAttachmentUrl(attachment.filePath)"
                  target="_blank"
                  class="flex items-center gap-3 p-3.5 rounded-xl border border-gray-200 hover:border-teal-300 hover:bg-teal-50/30 hover:-translate-y-0.5 hover:shadow-md transition-all group">
                  <div class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm" :class="{
                    'bg-gradient-to-br from-blue-100 to-blue-200 text-blue-600': isImage(attachment.mimeType),
                    'bg-gradient-to-br from-red-100 to-red-200 text-red-600': isPDF(attachment.mimeType),
                    'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-500': !isImage(attachment.mimeType) && !isPDF(attachment.mimeType)
                  }">
                    <svg v-if="isImage(attachment.mimeType)" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                      <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                    </svg>
                    <svg v-else-if="isPDF(attachment.mimeType)" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
                    </svg>
                    <svg v-else class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                      <path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z"/><polyline points="13 2 13 9 20 9"/>
                    </svg>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-semibold text-gray-800 truncate group-hover:text-teal-700 transition-colors">{{ attachment.originalName || attachment.fileName }}</p>
                    <p class="text-[11px] text-gray-400 mt-0.5">{{ formatFileSize(attachment.fileSize) }} &middot; {{ formatDate(attachment.createdAt) }}</p>
                  </div>
                  <div class="w-7 h-7 rounded-lg bg-gray-100 group-hover:bg-teal-500 flex items-center justify-center flex-shrink-0 transition-colors">
                    <svg class="w-3.5 h-3.5 text-gray-400 group-hover:text-white transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                  </div>
                </a>
              </div>
            </div>
          </div>

          <!-- ─ COMMENTS TAB ─ -->
          <div v-show="activeTab === 'comments'" class="max-w-3xl space-y-4">

            <!-- Comment list -->
            <div v-if="comments.length > 0" class="space-y-3">
              <div v-for="(comment, idx) in comments" :key="comment.id" class="flex gap-3">
                <!-- Thread line + avatar -->
                <div class="flex flex-col items-center flex-shrink-0">
                  <div class="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold shadow-sm">
                    {{ (comment.User?.fullName || comment.User?.email || '?').charAt(0).toUpperCase() }}
                  </div>
                  <div v-if="idx < comments.length - 1" class="w-px flex-1 bg-gray-200 mt-2 mb-1"></div>
                </div>

                <!-- Comment card -->
                <div class="flex-1 min-w-0 pb-3">
                  <div class="bg-white rounded-2xl border border-gray-200 shadow-sm hover:border-indigo-200 hover:shadow-md transition-all overflow-hidden">
                    <!-- Comment header -->
                    <div class="flex items-center justify-between px-4 py-3 bg-gray-50/60 border-b border-gray-100">
                      <div class="flex items-center gap-2">
                        <span class="text-sm font-bold text-gray-800">{{ comment.User?.fullName || comment.User?.email || 'Unknown User' }}</span>
                        <span v-if="comment.User?.fullName && comment.User?.email" class="text-[11px] text-gray-400">{{ comment.User.email }}</span>
                      </div>
                      <span class="text-[11px] text-gray-400 font-medium">{{ formatDate(comment.createdAt) }}</span>
                    </div>
                    <!-- Comment body -->
                    <div class="px-4 py-3 comment-body text-sm text-gray-700 leading-relaxed" v-html="comment.content"></div>

                    <!-- Comment attachments -->
                    <div v-if="comment.attachments && comment.attachments.length > 0" class="px-4 pb-3 flex flex-wrap gap-2">
                      <a v-for="attachment in comment.attachments" :key="attachment.id"
                        :href="getAttachmentUrl(attachment.filePath)"
                        target="_blank"
                        class="flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-50 hover:bg-indigo-50 border border-gray-200 hover:border-indigo-300 rounded-lg text-[11px] text-gray-600 hover:text-indigo-700 font-medium transition-all">
                        <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/>
                        </svg>
                        <span class="max-w-[160px] truncate">{{ attachment.originalName || attachment.fileName }}</span>
                        <span class="text-gray-400">({{ formatFileSize(attachment.fileSize) }})</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Empty state -->
            <div v-else class="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-12 flex flex-col items-center text-center">
              <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center mb-4">
                <svg class="w-8 h-8 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
                </svg>
              </div>
              <p class="text-base font-bold text-gray-700 mb-1">No comments yet</p>
              <p class="text-sm text-gray-400 mb-4">Start the conversation by adding the first comment.</p>
              <button @click="activeTab = 'comments'" class="text-xs font-semibold text-indigo-600 hover:text-indigo-700">
                Add a comment ↓
              </button>
            </div>

            <!-- Add comment box (only if not closed) -->
            <div v-if="ticket.status !== 'Closed'" class="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div class="flex items-center gap-3 px-5 py-3.5 border-b border-gray-100 bg-gradient-to-r from-indigo-50/70 to-purple-50/40">
                <div class="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                </div>
                <div>
                  <p class="text-sm font-bold text-gray-800">Add a Comment</p>
                  <p class="text-[11px] text-gray-400">Share an update or note with the team</p>
                </div>
              </div>
              <div class="p-4">
                <ckeditor
                  v-model="commentContent"
                  :editor="editor"
                  :config="editorConfig"
                  class="comment-editor"
                />

                <!-- File attach -->
                <div class="mt-4 p-3 rounded-xl bg-gray-50 border border-gray-200">
                  <p class="text-xs font-semibold text-gray-600 mb-2 flex items-center gap-1.5">
                    <svg class="w-3.5 h-3.5 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/>
                    </svg>
                    Attach Files <span class="text-gray-400 font-normal">(optional)</span>
                  </p>
                  <input
                    type="file"
                    ref="commentFileInput"
                    @change="handleCommentFileChange"
                    multiple
                    class="block w-full text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                    accept="image/*,.pdf,.doc,.docx,.txt"
                  />
                  <div v-if="commentFiles.length > 0" class="mt-2.5 flex flex-wrap gap-1.5">
                    <div v-for="(file, index) in commentFiles" :key="index"
                      class="flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-indigo-200 rounded-lg text-[11px] text-indigo-700 font-medium shadow-sm">
                      <svg class="w-3 h-3 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z"/>
                        <polyline points="13 2 13 9 20 9"/>
                      </svg>
                      <span class="max-w-[130px] truncate">{{ file.name }}</span>
                      <span class="text-indigo-300">({{ formatFileSize(file.size) }})</span>
                      <button type="button" @click="removeCommentFile(index)"
                        class="ml-0.5 w-4 h-4 rounded-full flex items-center justify-center text-indigo-300 hover:bg-red-100 hover:text-red-500 transition-colors">
                        <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      </button>
                    </div>
                  </div>
                </div>

                <div v-if="commentError" class="mt-3 flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600 font-medium">
                  <svg class="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  {{ commentError }}
                </div>

                <div class="flex items-center justify-between mt-4">
                  <p class="text-[11px] text-gray-400">Supports rich text formatting</p>
                  <button @click="addComment" :disabled="isSubmitting"
                    class="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-sm font-bold rounded-xl hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-200 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none">
                    <div v-if="isSubmitting" class="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
                    <svg v-else class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                    </svg>
                    {{ isSubmitting ? 'Posting…' : 'Post Comment' }}
                  </button>
                </div>
              </div>
            </div>

            <!-- Ticket closed notice -->
            <div v-else class="flex items-center gap-3 p-4 bg-gray-50 border border-gray-200 rounded-xl">
              <div class="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                <svg class="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
              </div>
              <div>
                <p class="text-sm font-semibold text-gray-600">Ticket is closed</p>
                <p class="text-xs text-gray-400">No new comments can be added to a closed ticket.</p>
              </div>
            </div>

          </div>
        </div>

        <!-- RIGHT: Activity Sidebar -->
        <div class="w-64 xl:w-72 flex-shrink-0 border-l border-indigo-100/80 bg-white/70 backdrop-blur-sm sticky top-0 self-start overflow-y-auto" style="max-height: 100vh; width: 260px;">
          <div class="p-4 space-y-4">

            <!-- Section label -->
            <div class="flex items-center gap-2 py-1">
              <div class="w-5 h-5 rounded-md bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center flex-shrink-0">
                <svg class="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
              </div>
              <span class="text-xs font-bold text-gray-700 uppercase tracking-wider">Activity</span>
            </div>

            <TimeTracking
              :ticketId="ticket.id"
              @timeLogged="handleTimeLogged"
            />
            <ActivityTimeline
              ref="activityTimelineRef"
              :ticketId="ticket.id"
            />
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import apiClient from '../api';
import { API_ORIGIN } from '../config';
import { useRoute, useRouter } from 'vue-router';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

import ActivityTimeline from '../components/ticket/ActivityTimeline.vue';
import StatusWorkflow from '../components/ticket/StatusWorkflow.vue';
import QuickActions from '../components/ticket/QuickActions.vue';
import TimeTracking from '../components/ticket/TimeTracking.vue';
import TeamProjectPanel from '../components/ticket/TeamProjectPanel.vue';
import ExportOptions from '../components/ticket/ExportOptions.vue';

const ticket = ref<any>(null);
const comments = ref<any[]>([]);
const commentContent = ref('');
const commentError = ref('');
const isSubmitting = ref(false);
const commentFiles = ref<File[]>([]);
const commentFileInput = ref<HTMLInputElement | null>(null);
const activeTab = ref<'description' | 'comments'>('description');
const route = useRoute();
const router = useRouter();
let pollingInterval: any;

const activityTimelineRef = ref<InstanceType<typeof ActivityTimeline> | null>(null);
const canChangeStatus = computed(() => true);
const canReassign = computed(() => true);

const editor = ClassicEditor as any;
const editorConfig = {
  toolbar: [
    'heading', '|',
    'bold', 'italic', '|',
    'link', 'blockQuote', '|',
    'bulletedList', 'numberedList', '|',
    'insertTable', '|',
    'undo', 'redo'
  ]
};

const formatDate = (date: string) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
};

const fetchTicketDetails = async () => {
  try {
    const ticketResponse = await apiClient.get(`/tickets/${route.params.id}`);
    ticket.value = ticketResponse.data;
    const commentsResponse = await apiClient.get(`/tickets/${route.params.id}/comments`);
    comments.value = commentsResponse.data;
  } catch (error) {
    console.error('Error getting ticket details or comments', error);
  }
};

const handleStatusChange = (newStatus: string) => {
  fetchTicketDetails();
  activityTimelineRef.value?.refresh();
};

const handleQuickAction = () => {
  fetchTicketDetails();
  activityTimelineRef.value?.refresh();
};

const handleTimeLogged = () => {
  activityTimelineRef.value?.refresh();
};

const handleReassigned = (newAssigneeId: number | null) => {
  fetchTicketDetails();
  activityTimelineRef.value?.refresh();
};

onMounted(() => {
  const ticketId = route.params.id;
  if (!ticketId || isNaN(Number(ticketId))) {
    if (ticketId === 'analytics') { router.push('/analytics'); return; }
    router.push('/tickets');
    return;
  }
  fetchTicketDetails();
  pollingInterval = setInterval(fetchTicketDetails, 5000);
});

onUnmounted(() => {
  if (pollingInterval) clearInterval(pollingInterval);
});

const handleCommentFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files) commentFiles.value = Array.from(target.files);
};

const removeCommentFile = (index: number) => {
  commentFiles.value.splice(index, 1);
  if (commentFileInput.value) commentFileInput.value.value = '';
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

const getAttachmentUrl = (filePath: string): string => {
  const filename = filePath.split(/[/\\]/).pop() || filePath;
  return `${API_ORIGIN}/uploads/tickets/${filename}`;
};

const isImage = (mimeType: string): boolean => mimeType?.startsWith('image/') || false;
const isPDF  = (mimeType: string): boolean => mimeType === 'application/pdf';

const addComment = async () => {
  commentError.value = '';
  if (!commentContent.value.trim()) {
    commentError.value = 'Comment cannot be empty.';
    return;
  }
  isSubmitting.value = true;
  try {
    const formData = new FormData();
    formData.append('content', commentContent.value);
    commentFiles.value.forEach((file) => formData.append('files', file));
    const response = await apiClient.post(`/tickets/${route.params.id}/comments`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    comments.value.push(response.data);
    commentContent.value = '';
    commentFiles.value = [];
    if (commentFileInput.value) commentFileInput.value.value = '';
  } catch (error) {
    console.error('Error adding comment', error);
    commentError.value = 'Failed to add comment. Please try again.';
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
/* ── CKEditor ── */
:deep(.ck-editor__editable) {
  min-height: 150px;
  max-height: 320px;
  font-size: 0.9rem;
  line-height: 1.7;
}
:deep(.ck.ck-toolbar) {
  border-radius: 12px 12px 0 0 !important;
  background: #f9fafb !important;
  border-color: #e5e7eb !important;
}
:deep(.ck.ck-editor__editable:not(.ck-editor__nested-editable)) {
  border-radius: 0 0 12px 12px !important;
  border-color: #e5e7eb !important;
}

/* ── Description rich-text prose ── */
.description-body { color: #374151; font-size: 0.9375rem; line-height: 1.75; }

.description-body :deep(p)          { margin: 0 0 0.875rem; }
.description-body :deep(p:last-child) { margin-bottom: 0; }
.description-body :deep(h1)         { font-size: 1.5rem; font-weight: 800; color: #111827; margin: 1.5rem 0 0.75rem; }
.description-body :deep(h2)         { font-size: 1.25rem; font-weight: 700; color: #1f2937; margin: 1.25rem 0 0.625rem; }
.description-body :deep(h3)         { font-size: 1.125rem; font-weight: 700; color: #1f2937; margin: 1rem 0 0.5rem; }
.description-body :deep(h4)         { font-size: 1rem; font-weight: 700; color: #374151; margin: 0.875rem 0 0.5rem; }
.description-body :deep(strong)     { font-weight: 700; color: #111827; }
.description-body :deep(em)         { font-style: italic; }
.description-body :deep(ul)         { list-style: disc; padding-left: 1.5rem; margin: 0.75rem 0; }
.description-body :deep(ol)         { list-style: decimal; padding-left: 1.5rem; margin: 0.75rem 0; }
.description-body :deep(li)         { margin-bottom: 0.35rem; }
.description-body :deep(a)          { color: #4f46e5; text-decoration: underline; }
.description-body :deep(a:hover)    { color: #4338ca; }
.description-body :deep(blockquote) {
  border-left: 4px solid #c7d2fe;
  background: #eef2ff;
  padding: 0.75rem 1rem;
  border-radius: 0 8px 8px 0;
  margin: 1rem 0;
  color: #4338ca;
  font-style: italic;
}
.description-body :deep(code) {
  background: #f3f4f6;
  color: #7c3aed;
  padding: 0.1em 0.4em;
  border-radius: 4px;
  font-size: 0.875em;
  font-family: 'SF Mono', 'Fira Code', monospace;
}
.description-body :deep(pre) {
  background: #1e293b;
  color: #e2e8f0;
  padding: 1rem 1.25rem;
  border-radius: 10px;
  overflow-x: auto;
  margin: 1rem 0;
  font-size: 0.875rem;
}
.description-body :deep(table)      { border-collapse: collapse; width: 100%; margin: 1rem 0; border-radius: 8px; overflow: hidden; }
.description-body :deep(th)         { background: #f0f4ff; color: #3730a3; font-weight: 700; text-align: left; padding: 0.625rem 0.875rem; border: 1px solid #c7d2fe; font-size: 0.8125rem; }
.description-body :deep(td)         { padding: 0.5rem 0.875rem; border: 1px solid #e5e7eb; font-size: 0.875rem; }
.description-body :deep(tr:nth-child(even) td) { background: #fafafa; }
.description-body :deep(.no-desc)   { color: #9ca3af; font-style: italic; }

/* ── Comment rich-text prose ── */
.comment-body { color: #374151; font-size: 0.875rem; line-height: 1.7; }

.comment-body :deep(p)              { margin: 0 0 0.625rem; }
.comment-body :deep(p:last-child)   { margin-bottom: 0; }
.comment-body :deep(h1),
.comment-body :deep(h2),
.comment-body :deep(h3)             { font-weight: 700; color: #1f2937; margin: 0.875rem 0 0.5rem; }
.comment-body :deep(h1)             { font-size: 1.125rem; }
.comment-body :deep(h2)             { font-size: 1rem; }
.comment-body :deep(h3)             { font-size: 0.9375rem; }
.comment-body :deep(strong)         { font-weight: 700; color: #111827; }
.comment-body :deep(em)             { font-style: italic; }
.comment-body :deep(ul)             { list-style: disc; padding-left: 1.25rem; margin: 0.5rem 0; }
.comment-body :deep(ol)             { list-style: decimal; padding-left: 1.25rem; margin: 0.5rem 0; }
.comment-body :deep(li)             { margin-bottom: 0.25rem; }
.comment-body :deep(a)              { color: #4f46e5; text-decoration: underline; }
.comment-body :deep(blockquote)     {
  border-left: 3px solid #c7d2fe;
  background: #eef2ff;
  padding: 0.5rem 0.875rem;
  border-radius: 0 6px 6px 0;
  margin: 0.5rem 0;
  color: #4338ca;
  font-style: italic;
}
.comment-body :deep(code) {
  background: #f3f4f6;
  color: #7c3aed;
  padding: 0.1em 0.35em;
  border-radius: 4px;
  font-size: 0.8125em;
  font-family: 'SF Mono', 'Fira Code', monospace;
}
.comment-body :deep(table)          { border-collapse: collapse; width: 100%; margin: 0.5rem 0; }
.comment-body :deep(th)             { background: #f0f4ff; color: #3730a3; font-weight: 700; padding: 0.375rem 0.625rem; border: 1px solid #c7d2fe; font-size: 0.75rem; }
.comment-body :deep(td)             { padding: 0.375rem 0.625rem; border: 1px solid #e5e7eb; font-size: 0.8125rem; }
</style>
