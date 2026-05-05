<script lang="ts">
import { Ckeditor } from '@ckeditor/ckeditor5-vue';

export default {
  components: {
    ckeditor: Ckeditor
  }
}
</script>

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
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            </div>
            <h1 class="text-2xl md:text-3xl font-bold text-white">Create New Ticket</h1>
          </div>
          <p class="text-blue-200 text-sm ml-14">Fill in the details below to submit a support ticket</p>
        </div>
        <router-link to="/tickets" class="inline-flex items-center gap-2 px-4 py-2.5 bg-white/15 text-white font-semibold rounded-xl text-sm border border-white/30 hover:bg-white/25 hover:-translate-y-0.5 transition-all self-start md:self-auto">
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Back to Tickets
        </router-link>
      </div>
    </div>

    <!-- Form Card -->
    <div class="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 p-6 md:p-8">
      <form @submit.prevent="createTicket" class="space-y-6">

        <!-- Category / Title -->
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">
            <span class="flex items-center gap-2">
              <svg class="w-4 h-4 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
              Ticket Category (Title)
            </span>
          </label>
          <select
            v-model.number="categoryId"
            @change="onCategoryChange"
            :class="['w-full px-4 py-3 rounded-xl border-2 text-sm bg-white transition-all outline-none', titleError ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-indigo-400']"
          >
            <option :value="null">Select Ticket Category</option>
            <option v-for="cat in complaintCategories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
          </select>
          <p v-if="titleError" class="mt-1 text-xs text-red-500 flex items-center gap-1">
            <svg class="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12" stroke="white"/><line x1="12" y1="16" x2="12.01" y2="16" stroke="white"/></svg>
            {{ titleError }}
          </p>
        </div>

        <!-- Description -->
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">
            <span class="flex items-center gap-2">
              <svg class="w-4 h-4 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                <polyline points="14,2 14,8 20,8"/>
              </svg>
              Description
            </span>
          </label>
          <div class="rounded-xl overflow-hidden border-2" :class="descriptionError ? 'border-red-400' : 'border-gray-200'">
            <ckeditor v-model="description" :editor="editor" :config="editorConfig" />
          </div>
          <p v-if="descriptionError" class="mt-1 text-xs text-red-500">{{ descriptionError }}</p>
        </div>

        <!-- Priority + Type + Severity -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              <span class="flex items-center gap-2">
                <svg class="w-4 h-4 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                Priority
              </span>
            </label>
            <select v-model="priority" class="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-400 text-sm bg-white outline-none transition-all">
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              <span class="flex items-center gap-2">
                <svg class="w-4 h-4 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
                Type
              </span>
            </label>
            <select v-model="type" class="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-400 text-sm bg-white outline-none transition-all">
              <option value="Task">Task</option>
              <option value="Bug">Bug</option>
              <option value="Story">Story</option>
              <option value="Epic">Epic</option>
              <option value="Subtask">Subtask</option>
              <option value="Improvement">Improvement</option>
              <option value="New Feature">New Feature</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              <span class="flex items-center gap-2">
                <svg class="w-4 h-4 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                Severity
              </span>
            </label>
            <select v-model="severity" class="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-400 text-sm bg-white outline-none transition-all">
              <option value="">None</option>
              <option value="Trivial">Trivial</option>
              <option value="Minor">Minor</option>
              <option value="Major">Major</option>
              <option value="Critical">Critical</option>
              <option value="Blocker">Blocker</option>
            </select>
          </div>
        </div>

        <!-- Project -->
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">
            <span class="flex items-center gap-2">
              <svg class="w-4 h-4 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h7l2 2h7a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2z"/></svg>
              Project <span class="text-red-400">*</span>
            </span>
          </label>
          <select
            v-model.number="projectId"
            @change="onProjectChange"
            :class="['w-full px-4 py-3 rounded-xl border-2 text-sm bg-white transition-all outline-none', projectError ? 'border-red-400' : 'border-gray-200 focus:border-indigo-400']"
          >
            <option :value="null">Select Project (Required)</option>
            <option v-for="project in projects" :key="project.id" :value="project.id">{{ project.name }} ({{ project.key }})</option>
          </select>
          <p v-if="projectError" class="mt-1 text-xs text-red-500">{{ projectError }}</p>
          <p v-if="projects.length === 0 && !loadingProjects" class="mt-1 text-xs text-gray-400 italic">No projects available. Please contact your administrator.</p>
        </div>

        <!-- Assignee -->
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">
            <span class="flex items-center gap-2">
              <svg class="w-4 h-4 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              Assignee
            </span>
          </label>
          <select v-model.number="assigneeId" :disabled="!projectId" class="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-400 text-sm bg-white outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed">
            <option :value="null">{{ projectId ? 'Select Assignee (Optional)' : 'Select a project first' }}</option>
            <option v-for="user in (projectMembers.length > 0 ? projectMembers : users)" :key="user.id" :value="user.id">
              {{ user.fullName || user.username || user.email }}
            </option>
          </select>
          <p v-if="projectId && projectMembers.length > 0" class="mt-1 text-xs text-gray-400 italic">Showing project members only</p>
        </div>

        <!-- File Upload -->
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">
            <span class="flex items-center gap-2">
              <svg class="w-4 h-4 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              Attach Files (Optional)
            </span>
          </label>
          <label class="block border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/30 transition-all">
            <svg class="w-8 h-8 mx-auto mb-2 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            <p class="text-sm text-gray-500">Click to upload files</p>
            <p class="text-xs text-gray-400 mt-1">Images, PDF, DOC, TXT</p>
            <input type="file" ref="fileInput" @change="handleFileChange" multiple class="hidden" accept="image/*,.pdf,.doc,.docx,.txt" />
          </label>
          <div v-if="attachedFiles.length > 0" class="mt-3 space-y-2">
            <div v-for="(file, index) in attachedFiles" :key="index"
              class="flex items-center gap-3 px-3 py-2 bg-indigo-50 rounded-xl border border-indigo-100">
              <svg class="w-4 h-4 text-indigo-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>
              <span class="text-xs font-medium text-gray-700 flex-1 truncate">{{ file.name }}</span>
              <span class="text-xs text-gray-400">{{ formatFileSize(file.size) }}</span>
              <button type="button" @click="removeFile(index)" class="text-red-400 hover:text-red-600 transition-colors">
                <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex gap-3 pt-4 border-t border-gray-100">
          <button type="submit" :disabled="isSubmitting"
            class="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl text-sm shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0">
            <svg v-if="!isSubmitting" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
            <div v-else class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            {{ isSubmitting ? 'Creating...' : 'Create Ticket' }}
          </button>
          <router-link to="/tickets" class="inline-flex items-center gap-2 px-6 py-3 border-2 border-gray-200 text-gray-600 font-semibold rounded-xl text-sm hover:border-gray-300 hover:bg-gray-50 transition-all">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            Cancel
          </router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import apiClient from '../api';
import { useRouter } from 'vue-router';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

interface User {
  id: number;
  username: string;
  email: string;
  fullName?: string;
}

interface ComplaintCategory {
  id: number;
  name: string;
}

interface Project {
  id: number;
  name: string;
  key: string;
  status: string;
}

const categoryId = ref<number | null>(null);
const title = ref('');
const description = ref('');
const priority = ref('Medium');
const type = ref('Task');
const severity = ref('');
const dueDate = ref<string | null>(null);
const assigneeId = ref<number | null>(null);
const projectId = ref<number | null>(null);
const titleError = ref('');
const descriptionError = ref('');
const projectError = ref('');
const isSubmitting = ref(false);
const loadingProjects = ref(false);
const users = ref<User[]>([]);
const projects = ref<Project[]>([]);
const projectMembers = ref<User[]>([]);
const complaintCategories = ref<ComplaintCategory[]>([]);
const attachedFiles = ref<File[]>([]);
const fileInput = ref<HTMLInputElement | null>(null);
const router = useRouter();

// CKEditor configuration
const editor = ClassicEditor as any;
const editorConfig = {
  toolbar: [
    'heading', '|',
    'bold', 'italic', 'underline', 'strikethrough', '|',
    'link', 'imageUpload', 'blockQuote', '|',
    'bulletedList', 'numberedList', '|',
    'insertTable', '|',
    'undo', 'redo'
  ]
};

const onCategoryChange = () => {
  if (categoryId.value) {
    const selectedCategory = complaintCategories.value.find(cat => cat.id === categoryId.value);
    if (selectedCategory) {
      title.value = selectedCategory.name;
    }
  } else {
    title.value = '';
  }
};

const onProjectChange = async () => {
  projectError.value = '';
  assigneeId.value = null;
  projectMembers.value = [];

  if (projectId.value) {
    try {
      const response = await apiClient.get(`/projects/${projectId.value}/members`);
      projectMembers.value = response.data.map((pm: any) => pm.user);
    } catch (error) {
      console.error('Error fetching project members:', error);
    }
  }
};

onMounted(async () => {
  try {
    loadingProjects.value = true;

    const [usersRes, projectsRes, categoriesRes] = await Promise.all([
      apiClient.get('/users'),
      apiClient.get('/projects/my-projects'),
      apiClient.get('/complaint-categories')
    ]);

    users.value = usersRes.data;
    projects.value = projectsRes.data;
    complaintCategories.value = categoriesRes.data;

    if (projects.value.length === 1) {
      projectId.value = projects.value[0].id;
      await onProjectChange();
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    projectError.value = 'Failed to load projects. Please refresh the page.';
  } finally {
    loadingProjects.value = false;
  }
});

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files) {
    attachedFiles.value = Array.from(target.files);
  }
};

const removeFile = (index: number) => {
  attachedFiles.value.splice(index, 1);
  if (fileInput.value) {
    fileInput.value.value = '';
  }
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

const validateForm = () => {
  titleError.value = '';
  descriptionError.value = '';
  projectError.value = '';
  let isValid = true;

  if (!categoryId.value) {
    titleError.value = 'Please select a ticket category.';
    isValid = false;
  }

  if (!description.value) {
    descriptionError.value = 'Description is required.';
    isValid = false;
  }

  if (!projectId.value) {
    projectError.value = 'Project is required. Please select a project.';
    isValid = false;
  }

  return isValid;
};

const createTicket = async () => {
  if (!validateForm()) {
    return;
  }

  isSubmitting.value = true;

  try {
    const formData = new FormData();
    formData.append('title', title.value);
    formData.append('description', description.value);
    formData.append('priority', priority.value);
    formData.append('category', categoryId.value?.toString() || '');
    formData.append('type', type.value);

    if (severity.value) {
      formData.append('severity', severity.value);
    }

    if (dueDate.value) {
      formData.append('dueDate', dueDate.value);
    }

    if (assigneeId.value) {
      formData.append('assigneeId', assigneeId.value.toString());
    }

    if (projectId.value) {
      formData.append('projectId', projectId.value.toString());
    }

    attachedFiles.value.forEach((file) => {
      formData.append('files', file);
    });

    await apiClient.post('/tickets', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    router.push('/tickets');
  } catch (error: any) {
    console.error('Error creating ticket', error);
    if (error.response && error.response.data && error.response.data.message) {
      titleError.value = error.response.data.message;
    } else {
      titleError.value = 'An unexpected error occurred.';
    }
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
:deep(.ck-editor__editable) {
  min-height: 280px;
  max-height: 480px;
}
</style>
