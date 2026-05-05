<template>
  <div class="min-h-screen bg-gray-50/80">

    <!-- Loading -->
    <div v-if="!ticket" class="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div class="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      <p class="text-gray-500 font-medium text-sm">Loading ticket details…</p>
    </div>

    <div v-else class="flex flex-col">

      <!-- ── TOP HEADER BAR ── -->
      <div class="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
        <!-- Breadcrumb -->
        <nav class="flex items-center gap-1.5 text-xs mb-3">
          <router-link to="/tickets" class="flex items-center gap-1 text-gray-400 hover:text-indigo-600 transition-colors font-medium">
            <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
            </svg>
            Tickets
          </router-link>
          <svg class="w-3 h-3 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
          <span class="font-mono px-1.5 py-0.5 bg-indigo-50 text-indigo-600 rounded font-bold">#{{ ticket.id }}</span>
          <svg class="w-3 h-3 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
          <span class="text-gray-500 truncate max-w-xs">{{ ticket.title }}</span>
        </nav>

        <!-- Title + Actions row -->
        <div class="flex items-start justify-between gap-4">
          <div class="flex items-center gap-3 min-w-0 flex-1">
            <div class="flex-shrink-0 w-3.5 h-3.5 rounded-full mt-1" :class="{
              'bg-green-500': ticket.priority?.toLowerCase() === 'low',
              'bg-amber-500': ticket.priority?.toLowerCase() === 'medium',
              'bg-red-500': ticket.priority?.toLowerCase() === 'high',
              'bg-purple-500': !['low','medium','high'].includes(ticket.priority?.toLowerCase() || '')
            }"></div>
            <h1 class="text-xl md:text-2xl font-bold text-gray-900 leading-tight">{{ ticket.title }}</h1>
          </div>

          <div class="flex items-center gap-2 flex-shrink-0 flex-wrap justify-end">
            <span class="px-2.5 py-1 text-[11px] font-bold rounded-full uppercase tracking-wider" :class="{
              'bg-blue-100 text-blue-700 ring-1 ring-blue-200': ticket.status === 'Open',
              'bg-amber-100 text-amber-700 ring-1 ring-amber-200': ticket.status === 'In Progress',
              'bg-green-100 text-green-700 ring-1 ring-green-200': ticket.status === 'Resolved',
              'bg-gray-100 text-gray-600 ring-1 ring-gray-200': ticket.status === 'Closed'
            }">{{ ticket.status }}</span>
            <ExportOptions :ticketId="ticket.id" />
            <router-link to="/tickets" class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-semibold rounded-lg transition-all">
              <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
              Back
            </router-link>
          </div>
        </div>

        <!-- Meta row -->
        <div class="flex flex-wrap items-center gap-4 mt-2.5 text-[11px] text-gray-400">
          <span class="flex items-center gap-1">
            <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            Created {{ formatDate(ticket.createdAt) }}
          </span>
          <span v-if="ticket.updatedAt && ticket.updatedAt !== ticket.createdAt" class="flex items-center gap-1">
            <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
            Updated {{ formatDate(ticket.updatedAt) }}
          </span>
          <span v-if="ticket.reporter" class="flex items-center gap-1">
            <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            Reported by
            <span class="text-gray-600 font-semibold">{{ ticket.reporter?.fullName || ticket.reporter?.email }}</span>
          </span>
        </div>
      </div>

      <!-- ── STATUS WORKFLOW ── -->
      <div class="bg-white border-b border-gray-200 px-6 py-3 flex-shrink-0">
        <StatusWorkflow
          :ticket="ticket"
          :canChangeStatus="canChangeStatus"
          @statusChanged="handleStatusChange"
        />
      </div>

      <!-- ── 3-COLUMN BODY ── -->
      <div class="flex min-h-0" style="min-height: calc(100vh - 180px);">

        <!-- LEFT: Properties Sidebar -->
        <div class="w-56 xl:w-64 flex-shrink-0 bg-white border-r border-gray-200 overflow-y-auto sticky top-0 self-start" style="max-height: calc(100vh - 180px);">
          <div class="p-4">

            <p class="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-4">Ticket Details</p>

            <div class="space-y-4">

              <!-- Status -->
              <div>
                <div class="text-[9px] font-semibold text-gray-400 uppercase tracking-widest mb-1">Status</div>
                <span class="inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-bold rounded-md border" :class="{
                  'bg-blue-50 text-blue-700 border-blue-200': ticket.status === 'Open',
                  'bg-amber-50 text-amber-700 border-amber-200': ticket.status === 'In Progress',
                  'bg-green-50 text-green-700 border-green-200': ticket.status === 'Resolved',
                  'bg-gray-50 text-gray-600 border-gray-200': ticket.status === 'Closed'
                }">
                  <div class="w-1.5 h-1.5 rounded-full" :class="{
                    'bg-blue-500': ticket.status === 'Open',
                    'bg-amber-500': ticket.status === 'In Progress',
                    'bg-green-500': ticket.status === 'Resolved',
                    'bg-gray-400': ticket.status === 'Closed'
                  }"></div>
                  {{ ticket.status }}
                </span>
              </div>

              <!-- Priority -->
              <div>
                <div class="text-[9px] font-semibold text-gray-400 uppercase tracking-widest mb-1">Priority</div>
                <span class="inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-bold rounded-md border" :class="{
                  'bg-green-50 text-green-700 border-green-200': ticket.priority?.toLowerCase() === 'low',
                  'bg-amber-50 text-amber-700 border-amber-200': ticket.priority?.toLowerCase() === 'medium',
                  'bg-red-50 text-red-700 border-red-200': ticket.priority?.toLowerCase() === 'high',
                  'bg-purple-50 text-purple-700 border-purple-200': !['low','medium','high'].includes(ticket.priority?.toLowerCase() || '')
                }">
                  <svg class="w-2.5 h-2.5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L4 14h16L12 2z"/></svg>
                  {{ ticket.priority || 'Normal' }}
                </span>
              </div>

              <!-- Type -->
              <div>
                <div class="text-[9px] font-semibold text-gray-400 uppercase tracking-widest mb-1">Type</div>
                <span class="inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-semibold rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                  <svg class="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
                  {{ ticket.type || 'Task' }}
                </span>
              </div>

              <!-- Assignee -->
              <div>
                <div class="text-[9px] font-semibold text-gray-400 uppercase tracking-widest mb-1">Assignee</div>
                <div class="flex items-center gap-2 mt-1">
                  <div class="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0">
                    {{ (ticket.assignee?.fullName || ticket.assignee?.email || 'U').charAt(0).toUpperCase() }}
                  </div>
                  <span class="text-xs text-gray-700 font-medium truncate">
                    {{ ticket.assignee?.fullName || ticket.assignee?.email || 'Unassigned' }}
                  </span>
                </div>
              </div>

              <!-- Reporter -->
              <div>
                <div class="text-[9px] font-semibold text-gray-400 uppercase tracking-widest mb-1">Reporter</div>
                <div class="flex items-center gap-2 mt-1">
                  <div class="w-6 h-6 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0">
                    {{ (ticket.reporter?.fullName || ticket.reporter?.email || '?').charAt(0).toUpperCase() }}
                  </div>
                  <span class="text-xs text-gray-700 font-medium truncate">
                    {{ ticket.reporter?.fullName || ticket.reporter?.email || 'Unknown' }}
                  </span>
                </div>
              </div>

              <!-- Project -->
              <div>
                <div class="text-[9px] font-semibold text-gray-400 uppercase tracking-widest mb-1">Project</div>
                <div class="flex items-center gap-1.5 mt-1">
                  <svg class="w-3 h-3 text-indigo-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M4 4h7l2 2h7a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2z"/>
                  </svg>
                  <span class="text-xs text-gray-700 font-medium">{{ ticket.project?.name || 'General' }}</span>
                </div>
              </div>

              <!-- Severity (if present) -->
              <div v-if="ticket.severity">
                <div class="text-[9px] font-semibold text-gray-400 uppercase tracking-widest mb-1">Severity</div>
                <span class="inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-semibold rounded-md bg-rose-50 text-rose-700 border border-rose-200">
                  {{ ticket.severity }}
                </span>
              </div>

            </div>

            <!-- Timestamps -->
            <div class="mt-5 pt-4 border-t border-gray-100 space-y-2.5">
              <p class="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-3">Timestamps</p>
              <div class="flex items-start gap-2">
                <span class="text-[9px] text-gray-400 uppercase tracking-wider w-12 flex-shrink-0 pt-0.5">Created</span>
                <span class="text-[11px] text-gray-600 font-medium leading-tight">{{ formatDate(ticket.createdAt) }}</span>
              </div>
              <div v-if="ticket.updatedAt" class="flex items-start gap-2">
                <span class="text-[9px] text-gray-400 uppercase tracking-wider w-12 flex-shrink-0 pt-0.5">Updated</span>
                <span class="text-[11px] text-gray-600 font-medium leading-tight">{{ formatDate(ticket.updatedAt) }}</span>
              </div>
            </div>

            <!-- Team Project Panel -->
            <div class="mt-5 pt-4 border-t border-gray-100">
              <TeamProjectPanel
                :ticket="ticket"
                :canReassign="canReassign"
                @reassigned="handleReassigned"
              />
            </div>

            <!-- Quick Actions -->
            <div class="mt-4 pt-4 border-t border-gray-100">
              <QuickActions
                :ticket="ticket"
                @actionComplete="handleQuickAction"
              />
            </div>

          </div>
        </div>

        <!-- CENTER: Main Content -->
        <div class="flex-1 min-w-0 overflow-y-auto">
          <div class="p-5 max-w-3xl">

            <!-- Tabs -->
            <div class="flex items-center gap-1 mb-5 bg-gray-100 p-1 rounded-xl w-fit">
              <button @click="activeTab = 'description'"
                :class="activeTab === 'description' ? 'bg-white shadow-sm text-gray-900 font-semibold' : 'text-gray-500 hover:text-gray-700'"
                class="px-4 py-1.5 text-sm rounded-lg transition-all flex items-center gap-1.5">
                <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                  <polyline points="14,2 14,8 20,8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                </svg>
                Description
              </button>
              <button @click="activeTab = 'comments'"
                :class="activeTab === 'comments' ? 'bg-white shadow-sm text-gray-900 font-semibold' : 'text-gray-500 hover:text-gray-700'"
                class="px-4 py-1.5 text-sm rounded-lg transition-all flex items-center gap-1.5">
                <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
                </svg>
                Comments
                <span v-if="comments.length > 0" class="min-w-[18px] h-[18px] flex items-center justify-center bg-indigo-100 text-indigo-700 text-[10px] font-bold rounded-full px-1">{{ comments.length }}</span>
              </button>
            </div>

            <!-- ─ DESCRIPTION TAB ─ -->
            <div v-show="activeTab === 'description'">
              <div class="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div class="px-5 py-3 border-b border-gray-100 flex items-center gap-2 bg-gray-50/50">
                  <svg class="w-4 h-4 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                    <polyline points="14,2 14,8 20,8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                  </svg>
                  <h2 class="text-sm font-semibold text-gray-700">Description</h2>
                </div>
                <div class="p-5 description-body text-sm text-gray-700 leading-relaxed" v-html="ticket.description || '<p style=\'color:#9ca3af;font-style:italic\'>No description provided.</p>'"></div>

                <!-- Attachments -->
                <div v-if="ticket.attachments && ticket.attachments.length > 0" class="px-5 pb-5 border-t border-gray-100 pt-4">
                  <div class="flex items-center gap-2 mb-3">
                    <svg class="w-3.5 h-3.5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/>
                    </svg>
                    <h3 class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Attachments ({{ ticket.attachments.length }})</h3>
                  </div>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <a
                      v-for="attachment in ticket.attachments"
                      :key="attachment.id"
                      :href="getAttachmentUrl(attachment.filePath)"
                      target="_blank"
                      class="flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all group"
                    >
                      <div class="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" :class="{
                        'bg-blue-100 text-blue-600': isImage(attachment.mimeType),
                        'bg-red-100 text-red-600': isPDF(attachment.mimeType),
                        'bg-gray-100 text-gray-500': !isImage(attachment.mimeType) && !isPDF(attachment.mimeType)
                      }">
                        <svg v-if="isImage(attachment.mimeType)" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                        </svg>
                        <svg v-else-if="isPDF(attachment.mimeType)" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                          <polyline points="14 2 14 8 20 8"/>
                        </svg>
                        <svg v-else class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z"/>
                          <polyline points="13 2 13 9 20 9"/>
                        </svg>
                      </div>
                      <div class="flex-1 min-w-0">
                        <p class="text-xs font-semibold text-gray-800 truncate">{{ attachment.originalName || attachment.fileName }}</p>
                        <p class="text-[10px] text-gray-400 mt-0.5">{{ formatFileSize(attachment.fileSize) }} · {{ formatDate(attachment.createdAt) }}</p>
                      </div>
                      <svg class="w-3.5 h-3.5 text-gray-300 group-hover:text-indigo-500 transition-colors flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                        <polyline points="7 10 12 15 17 10"/>
                        <line x1="12" y1="15" x2="12" y2="3"/>
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <!-- ─ COMMENTS TAB ─ -->
            <div v-show="activeTab === 'comments'" class="space-y-3">

              <!-- Comment list -->
              <div v-if="comments.length > 0" class="space-y-3">
                <div v-for="comment in comments" :key="comment.id"
                  class="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 hover:border-indigo-200 transition-colors">
                  <div class="flex items-start gap-3">
                    <div class="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {{ (comment.User?.email || '?').charAt(0).toUpperCase() }}
                    </div>
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center justify-between mb-2">
                        <span class="text-sm font-semibold text-gray-800">{{ comment.User?.email || 'Unknown User' }}</span>
                        <span class="text-[11px] text-gray-400">{{ formatDate(comment.createdAt) }}</span>
                      </div>
                      <div class="text-sm text-gray-600 leading-relaxed comment-body" v-html="comment.content"></div>

                      <!-- Comment attachments -->
                      <div v-if="comment.attachments && comment.attachments.length > 0" class="mt-3 pt-3 border-t border-gray-100 flex flex-wrap gap-1.5">
                        <a
                          v-for="attachment in comment.attachments"
                          :key="attachment.id"
                          :href="getAttachmentUrl(attachment.filePath)"
                          target="_blank"
                          class="flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 hover:bg-indigo-50 border border-gray-200 hover:border-indigo-300 rounded-lg text-[11px] text-gray-600 hover:text-indigo-700 transition-all"
                        >
                          <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/>
                          </svg>
                          <span class="max-w-[150px] truncate">{{ attachment.originalName || attachment.fileName }}</span>
                          <span class="text-gray-400">({{ formatFileSize(attachment.fileSize) }})</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Empty state -->
              <div v-else class="bg-white rounded-2xl border border-gray-200 shadow-sm p-10 flex flex-col items-center text-center">
                <div class="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center mb-3">
                  <svg class="w-6 h-6 text-indigo-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
                  </svg>
                </div>
                <p class="text-sm font-semibold text-gray-600 mb-1">No comments yet</p>
                <p class="text-xs text-gray-400">Be the first to add a comment below.</p>
              </div>

              <!-- Add comment -->
              <div v-if="ticket.status !== 'Closed'" class="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div class="px-5 py-3 border-b border-gray-100 flex items-center gap-2.5 bg-gray-50/60">
                  <div class="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">Y</div>
                  <span class="text-sm font-semibold text-gray-700">Add a comment</span>
                </div>
                <div class="p-4">
                  <ckeditor
                    v-model="commentContent"
                    :editor="editor"
                    :config="editorConfig"
                    class="comment-editor"
                  />

                  <!-- File attach -->
                  <div class="mt-3">
                    <p class="text-[11px] font-semibold text-gray-500 mb-1.5 flex items-center gap-1">
                      <svg class="w-3 h-3 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                      </svg>
                      Attach files (optional)
                    </p>
                    <input
                      type="file"
                      ref="commentFileInput"
                      @change="handleCommentFileChange"
                      multiple
                      class="block w-full text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 border-2 border-dashed border-gray-200 rounded-xl p-2 cursor-pointer hover:border-indigo-300 hover:bg-indigo-50/20 transition-all"
                      accept="image/*,.pdf,.doc,.docx,.txt"
                    />
                    <div v-if="commentFiles.length > 0" class="mt-2 flex flex-wrap gap-1.5">
                      <div v-for="(file, index) in commentFiles" :key="index"
                        class="flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 border border-indigo-200 rounded-lg text-[11px] text-indigo-700">
                        <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z"/>
                          <polyline points="13 2 13 9 20 9"/>
                        </svg>
                        <span class="max-w-[120px] truncate">{{ file.name }}</span>
                        <span class="text-indigo-400">({{ formatFileSize(file.size) }})</span>
                        <button type="button" @click="removeCommentFile(index)" class="ml-0.5 text-indigo-400 hover:text-red-500 transition-colors">
                          <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div v-if="commentError" class="mt-2 text-xs text-red-500 font-medium flex items-center gap-1">
                    <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    {{ commentError }}
                  </div>

                  <div class="flex justify-end mt-4">
                    <button @click="addComment" :disabled="isSubmitting"
                      class="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white text-sm font-semibold rounded-xl hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-200/60 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none">
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
              <div v-else class="flex items-center gap-3 p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-500">
                <svg class="w-4 h-4 text-gray-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
                Ticket is closed — no new comments can be added.
              </div>

            </div>
          </div>
        </div>

        <!-- RIGHT: Activity Sidebar -->
        <div class="w-64 xl:w-72 flex-shrink-0 bg-white border-l border-gray-200 overflow-y-auto sticky top-0 self-start" style="max-height: calc(100vh - 180px);">
          <div class="p-4 space-y-4">
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
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
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
    console.error('Invalid ticket ID:', ticketId);
    if (ticketId === 'analytics') {
      router.push('/analytics');
      return;
    }
    router.push('/tickets');
    return;
  }

  fetchTicketDetails();
  pollingInterval = setInterval(fetchTicketDetails, 5000);
});

onUnmounted(() => {
  if (pollingInterval) {
    clearInterval(pollingInterval);
  }
});

const handleCommentFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files) {
    commentFiles.value = Array.from(target.files);
  }
};

const removeCommentFile = (index: number) => {
  commentFiles.value.splice(index, 1);
  if (commentFileInput.value) {
    commentFileInput.value.value = '';
  }
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

const isImage = (mimeType: string): boolean => {
  return mimeType?.startsWith('image/') || false;
};

const isPDF = (mimeType: string): boolean => {
  return mimeType === 'application/pdf';
};

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

    commentFiles.value.forEach((file) => {
      formData.append('files', file);
    });

    const response = await apiClient.post(`/tickets/${route.params.id}/comments`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    comments.value.push(response.data);
    commentContent.value = '';
    commentFiles.value = [];
    if (commentFileInput.value) {
      commentFileInput.value.value = '';
    }
  } catch (error) {
    console.error('Error adding comment', error);
    commentError.value = 'Failed to add comment.';
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
:deep(.ck-editor__editable) {
  min-height: 140px;
  max-height: 300px;
}

.description-body :deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin: 0.75rem 0;
}

.description-body :deep(table td),
.description-body :deep(table th) {
  border: 1px solid #e5e7eb;
  padding: 0.5rem 0.75rem;
}

.description-body :deep(table th) {
  background: #f9fafb;
  font-weight: 600;
}

.comment-body :deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin: 0.5rem 0;
}

.comment-body :deep(table td),
.comment-body :deep(table th) {
  border: 1px solid #e5e7eb;
  padding: 0.375rem 0.625rem;
  font-size: 0.8125rem;
}

.comment-body :deep(p) {
  margin: 0 0 0.5rem;
}

.comment-body :deep(p:last-child) {
  margin-bottom: 0;
}
</style>
