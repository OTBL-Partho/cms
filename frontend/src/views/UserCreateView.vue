<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50 to-purple-50 p-4 md:p-6 lg:p-8">

    <!-- Header -->
    <div class="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-6 md:p-8 mb-6 shadow-2xl shadow-indigo-200">
      <div class="absolute -top-8 -right-8 w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>
      <div class="absolute -bottom-8 -left-8 w-40 h-40 bg-pink-400/20 rounded-full blur-2xl"></div>
      <div class="relative flex items-center gap-4">
        <div class="w-12 h-12 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center flex-shrink-0">
          <svg class="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <line x1="19" y1="8" x2="19" y2="14"/>
            <line x1="22" y1="11" x2="16" y2="11"/>
          </svg>
        </div>
        <div>
          <h1 class="text-2xl md:text-3xl font-bold text-white">Create New User</h1>
          <p class="text-indigo-200 text-sm mt-0.5">Add a new user to the system with appropriate permissions and details</p>
        </div>
      </div>
    </div>

    <!-- Alert messages -->
    <div v-if="successMessage" class="mb-4 flex items-center gap-3 px-4 py-3 bg-green-50 border border-green-200 rounded-2xl text-green-800 text-sm font-medium">
      <svg class="w-5 h-5 text-green-500 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22,4 12,14.01 9,11.01"/></svg>
      {{ successMessage }}
    </div>
    <div v-if="errorMessage" class="mb-4 flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-2xl text-red-800 text-sm font-medium">
      <svg class="w-5 h-5 text-red-500 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
      {{ errorMessage }}
    </div>

    <!-- Form -->
    <form @submit.prevent="createUser" class="space-y-5">

      <!-- Personal Information -->
      <div class="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
          <div class="w-8 h-8 bg-indigo-100 rounded-xl flex items-center justify-center">
            <svg class="w-4 h-4 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </div>
          <div>
            <h3 class="font-bold text-gray-800 text-sm">Personal Information</h3>
            <p class="text-xs text-gray-400">Basic user details and contact information</p>
          </div>
        </div>
        <div class="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">

          <div>
            <label class="block text-xs font-semibold text-gray-600 mb-1.5">Full Name <span class="text-red-400">*</span></label>
            <input type="text" v-model="user.fullName" placeholder="Enter full name" required
              :class="['w-full px-3.5 py-2.5 rounded-xl border-2 text-sm transition-all outline-none', errors.fullName ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-indigo-400 bg-white']">
            <p v-if="errors.fullName" class="mt-1 text-xs text-red-500">{{ errors.fullName }}</p>
          </div>

          <div>
            <label class="block text-xs font-semibold text-gray-600 mb-1.5">Email Address <span class="text-red-400">*</span></label>
            <input type="email" v-model="user.email" placeholder="Enter email address" required
              :class="['w-full px-3.5 py-2.5 rounded-xl border-2 text-sm transition-all outline-none', errors.email ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-indigo-400 bg-white']">
            <p v-if="errors.email" class="mt-1 text-xs text-red-500">{{ errors.email }}</p>
          </div>

          <div>
            <label class="block text-xs font-semibold text-gray-600 mb-1.5">Phone Number</label>
            <input type="tel" v-model="user.phoneNumber" placeholder="Enter phone number"
              class="w-full px-3.5 py-2.5 rounded-xl border-2 border-gray-200 focus:border-indigo-400 text-sm transition-all outline-none bg-white">
          </div>

          <!-- Profile Picture -->
          <div>
            <label class="block text-xs font-semibold text-gray-600 mb-1.5">Profile Picture</label>
            <div v-if="profilePicturePreview" class="relative inline-block">
              <img :src="profilePicturePreview" alt="Preview" class="w-20 h-20 rounded-2xl object-cover border-2 border-indigo-100">
              <button type="button" @click="removeProfilePicture" class="absolute -top-1.5 -right-1.5 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow">
                <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div v-else @click="triggerFileInput" class="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-indigo-300 hover:bg-indigo-50/30 transition-all">
              <svg class="w-8 h-8 text-gray-300 mb-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>
              <p class="text-xs text-gray-500 font-medium">Click to upload</p>
              <span class="text-[10px] text-gray-400">Max 5MB, JPG/PNG/GIF</span>
            </div>
            <input type="file" ref="fileInput" id="profilePictureInput" @change="handleFileUpload" accept="image/*" class="hidden">
          </div>
        </div>
      </div>

      <!-- Professional Information -->
      <div class="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
          <div class="w-8 h-8 bg-purple-100 rounded-xl flex items-center justify-center">
            <svg class="w-4 h-4 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/></svg>
          </div>
          <div>
            <h3 class="font-bold text-gray-800 text-sm">Professional Information</h3>
            <p class="text-xs text-gray-400">Work-related details and role assignment</p>
          </div>
        </div>
        <div class="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">

          <div>
            <label class="block text-xs font-semibold text-gray-600 mb-1.5">Role <span class="text-red-400">*</span></label>
            <select v-model="user.role" required
              :class="['w-full px-3.5 py-2.5 rounded-xl border-2 text-sm transition-all outline-none bg-white', errors.role ? 'border-red-400' : 'border-gray-200 focus:border-indigo-400']">
              <option value="">Select a role</option>
              <option v-for="role in availableRoles" :key="role.value" :value="role.value">{{ role.label }}</option>
            </select>
            <p v-if="errors.role" class="mt-1 text-xs text-red-500">{{ errors.role }}</p>
            <div v-if="user.role" class="mt-2 px-3 py-2 bg-indigo-50 border-l-4 border-indigo-400 rounded-r-xl">
              <p class="text-xs text-indigo-700">{{ getRoleDescription(user.role) }}</p>
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold text-gray-600 mb-1.5">Designation</label>
            <input type="text" v-model="user.designation" placeholder="Enter job designation"
              class="w-full px-3.5 py-2.5 rounded-xl border-2 border-gray-200 focus:border-indigo-400 text-sm transition-all outline-none bg-white">
          </div>

          <div>
            <label class="block text-xs font-semibold text-gray-600 mb-1.5">Division</label>
            <input type="text" v-model="user.division" placeholder="Enter department/division"
              class="w-full px-3.5 py-2.5 rounded-xl border-2 border-gray-200 focus:border-indigo-400 text-sm transition-all outline-none bg-white">
          </div>

          <div>
            <label class="block text-xs font-semibold text-gray-600 mb-1.5">Reporting Manager</label>
            <select v-model="user.managerId" class="w-full px-3.5 py-2.5 rounded-xl border-2 border-gray-200 focus:border-indigo-400 text-sm transition-all outline-none bg-white">
              <option value="">Select reporting manager</option>
              <option v-for="manager in managers" :key="manager.id" :value="manager.id">{{ manager.fullName }} ({{ manager.role }})</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Project Assignment -->
      <div class="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
          <div class="w-8 h-8 bg-teal-100 rounded-xl flex items-center justify-center">
            <svg class="w-4 h-4 text-teal-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21h18"/><path d="M5 21V7l8-4v18"/><path d="M19 21V11l-6-4"/></svg>
          </div>
          <div>
            <h3 class="font-bold text-gray-800 text-sm">Project Assignment</h3>
            <p class="text-xs text-gray-400">Assign the user to one or more projects</p>
          </div>
        </div>
        <div class="p-6">
          <ProjectAssignment v-model="user.projects" />
        </div>
      </div>

      <!-- Security Settings -->
      <div class="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
          <div class="w-8 h-8 bg-red-100 rounded-xl flex items-center justify-center">
            <svg class="w-4 h-4 text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><circle cx="12" cy="16" r="1"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
          </div>
          <div>
            <h3 class="font-bold text-gray-800 text-sm">Security Settings</h3>
            <p class="text-xs text-gray-400">Password and access control settings</p>
          </div>
        </div>
        <div class="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">

          <!-- Password -->
          <div>
            <label class="block text-xs font-semibold text-gray-600 mb-1.5">Password <span class="text-red-400">*</span></label>
            <div class="relative">
              <input :type="showPassword ? 'text' : 'password'" v-model="user.password" placeholder="Enter password" required
                :class="['w-full px-3.5 py-2.5 pr-10 rounded-xl border-2 text-sm transition-all outline-none', errors.password ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-indigo-400 bg-white']">
              <button type="button" @click="togglePassword" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                <svg v-if="showPassword" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                <svg v-else class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              </button>
            </div>
            <p v-if="errors.password" class="mt-1 text-xs text-red-500">{{ errors.password }}</p>
            <!-- Strength bar -->
            <div class="mt-2">
              <div class="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                <div class="h-full rounded-full transition-all duration-300"
                  :style="{ width: passwordStrength.percentage + '%', backgroundColor: passwordStrength.percentage < 30 ? '#ef4444' : passwordStrength.percentage < 60 ? '#f59e0b' : '#10b981' }">
                </div>
              </div>
              <p v-if="passwordStrength.text" class="text-xs text-gray-400 mt-0.5">Strength: {{ passwordStrength.text }}</p>
            </div>
          </div>

          <!-- Confirm Password -->
          <div>
            <label class="block text-xs font-semibold text-gray-600 mb-1.5">Confirm Password <span class="text-red-400">*</span></label>
            <input type="password" v-model="confirmPassword" placeholder="Confirm password" required
              :class="['w-full px-3.5 py-2.5 rounded-xl border-2 text-sm transition-all outline-none', errors.confirmPassword ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-indigo-400 bg-white']">
            <p v-if="errors.confirmPassword" class="mt-1 text-xs text-red-500">{{ errors.confirmPassword }}</p>
          </div>

          <!-- Account Status -->
          <div>
            <label class="block text-xs font-semibold text-gray-600 mb-2">Account Status</label>
            <div class="flex gap-3">
              <label class="flex items-center gap-2 cursor-pointer px-3 py-2 rounded-xl border-2 transition-all"
                :class="user.status === 'active' ? 'border-green-400 bg-green-50' : 'border-gray-200'">
                <input type="radio" v-model="user.status" value="active" class="hidden">
                <span class="w-3 h-3 rounded-full" :class="user.status === 'active' ? 'bg-green-500' : 'bg-gray-300'"></span>
                <span class="text-sm font-medium" :class="user.status === 'active' ? 'text-green-700' : 'text-gray-500'">Active</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer px-3 py-2 rounded-xl border-2 transition-all"
                :class="user.status === 'inactive' ? 'border-red-400 bg-red-50' : 'border-gray-200'">
                <input type="radio" v-model="user.status" value="inactive" class="hidden">
                <span class="w-3 h-3 rounded-full" :class="user.status === 'inactive' ? 'bg-red-500' : 'bg-gray-300'"></span>
                <span class="text-sm font-medium" :class="user.status === 'inactive' ? 'text-red-700' : 'text-gray-500'">Inactive</span>
              </label>
            </div>
          </div>

          <!-- Permissions -->
          <div>
            <label class="block text-xs font-semibold text-gray-600 mb-2">Permissions</label>
            <div class="grid grid-cols-2 gap-2">
              <label v-for="permission in availablePermissions" :key="permission.key"
                class="flex items-center gap-2 cursor-pointer p-2.5 rounded-xl border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all">
                <input type="checkbox" v-model="user.permissions" :value="permission.key" class="w-3.5 h-3.5 accent-indigo-600">
                <span class="text-xs text-gray-700">{{ permission.label }}</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <!-- Form Actions -->
      <div class="flex gap-3 justify-end pt-2">
        <button type="button" @click="resetForm"
          class="inline-flex items-center gap-2 px-5 py-2.5 border-2 border-gray-200 text-gray-600 font-semibold rounded-xl text-sm hover:border-gray-300 hover:bg-gray-50 transition-all">
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1,4 1,10 7,10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/></svg>
          Reset Form
        </button>
        <button type="submit" :disabled="isLoading"
          class="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl text-sm shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0">
          <svg v-if="!isLoading" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
          <div v-else class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          {{ isLoading ? 'Creating User...' : 'Create User' }}
        </button>
      </div>

    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import apiClient from '../api';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import ProjectAssignment from '../components/ProjectAssignment.vue';

const router = useRouter();
const authStore = useAuthStore();

const user = ref({
  fullName: '',
  email: '',
  password: '',
  role: '' as 'Super Admin' | 'Admin' | 'Manager' | 'Agent' | 'User',
  designation: '',
  division: '',
  phoneNumber: '',
  profilePicture: '',
  managerId: '',
  status: 'active' as 'active' | 'inactive',
  permissions: [] as string[],
  projects: [] as number[]
});

const confirmPassword = ref('');
const showPassword = ref(false);
const isLoading = ref(false);
const successMessage = ref('');
const errorMessage = ref('');
const errors = ref<Record<string, string>>({});
const profilePicturePreview = ref('');
const fileInput = ref<HTMLInputElement | null>(null);

const availableRoles = computed(() => {
  const currentUserRole = authStore.user?.role;
  const roles = [
    { value: 'User', label: 'User' },
    { value: 'Agent', label: 'Agent' },
    { value: 'Manager', label: 'Manager' }
  ];

  if (currentUserRole === 'Super Admin') {
    roles.push(
      { value: 'Admin', label: 'Admin' },
      { value: 'Super Admin', label: 'Super Admin' }
    );
  } else if (currentUserRole === 'Admin') {
    roles.push({ value: 'Admin', label: 'Admin' });
  }

  return roles;
});

const availablePermissions = ref([
  { key: 'read_tickets', label: 'Read Tickets' },
  { key: 'create_tickets', label: 'Create Tickets' },
  { key: 'update_tickets', label: 'Update Tickets' },
  { key: 'delete_tickets', label: 'Delete Tickets' },
  { key: 'manage_users', label: 'Manage Users' },
  { key: 'view_reports', label: 'View Reports' },
  { key: 'manage_settings', label: 'Manage Settings' },
  { key: 'access_admin', label: 'Access Admin Panel' }
]);

const managers = ref<any[]>([]);

const passwordStrength = computed(() => {
  const password = user.value.password;
  if (!password) return { class: '', percentage: 0, text: '' };

  let score = 0;
  if (password.length >= 8) score += 20;
  if (password.length >= 12) score += 10;
  if (/[a-z]/.test(password)) score += 10;
  if (/[A-Z]/.test(password)) score += 10;
  if (/[0-9]/.test(password)) score += 10;
  if (/[^A-Za-z0-9]/.test(password)) score += 10;
  if (password.length >= 16) score += 20;
  if (/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(password)) score += 10;

  if (score < 30) return { class: 'weak', percentage: score, text: 'Weak' };
  if (score < 60) return { class: 'medium', percentage: score, text: 'Medium' };
  if (score < 80) return { class: 'strong', percentage: score, text: 'Strong' };
  return { class: 'very-strong', percentage: score, text: 'Very Strong' };
});

const getRoleDescription = (role: string) => {
  const descriptions: Record<string, string> = {
    'Super Admin': 'Full system access with all permissions',
    'Admin': 'Administrative access to manage users and system settings',
    'Manager': 'Can manage team members and view reports',
    'Agent': 'Can handle tickets and customer interactions',
    'User': 'Basic access to view and create tickets'
  };
  return descriptions[role] || 'Select a role to see description';
};

const validateForm = () => {
  errors.value = {};

  if (!user.value.fullName.trim()) errors.value.fullName = 'Full name is required';

  if (!user.value.email.trim()) {
    errors.value.email = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.value.email)) {
    errors.value.email = 'Please enter a valid email address';
  }

  if (!user.value.role) errors.value.role = 'Please select a role';

  if (!user.value.password) {
    errors.value.password = 'Password is required';
  } else if (user.value.password.length < 8) {
    errors.value.password = 'Password must be at least 8 characters long';
  }

  if (!confirmPassword.value) {
    errors.value.confirmPassword = 'Please confirm your password';
  } else if (user.value.password !== confirmPassword.value) {
    errors.value.confirmPassword = 'Passwords do not match';
  }

  return Object.keys(errors.value).length === 0;
};

const togglePassword = () => { showPassword.value = !showPassword.value; };

const triggerFileInput = () => { fileInput.value?.click(); };

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (file) {
    if (!file.type.startsWith('image/')) { errorMessage.value = 'Please select an image file.'; return; }
    if (file.size > 5 * 1024 * 1024) { errorMessage.value = 'Image size should be less than 5MB.'; return; }

    const reader = new FileReader();
    reader.onload = (e) => {
      profilePicturePreview.value = e.target?.result as string;
      user.value.profilePicture = e.target?.result as string;
    };
    reader.readAsDataURL(file);
    errorMessage.value = '';
  }
};

const removeProfilePicture = () => {
  profilePicturePreview.value = '';
  user.value.profilePicture = '';
  if (fileInput.value) fileInput.value.value = '';
};

const createUser = async () => {
  if (!validateForm()) { errorMessage.value = 'Please fix the errors below'; return; }

  isLoading.value = true;
  successMessage.value = '';
  errorMessage.value = '';

  try {
    const userData = { ...user.value, permissions: user.value.permissions.join(',') };
    await apiClient.post('/users', userData);
    successMessage.value = 'User created successfully!';
    setTimeout(() => { resetForm(); router.push('/admin'); }, 2000);
  } catch (error: any) {
    console.error('Error creating user:', error);
    errorMessage.value = error.response?.data?.message || 'Error creating user. Please try again.';
  } finally {
    isLoading.value = false;
  }
};

const resetForm = () => {
  user.value = {
    fullName: '', email: '', password: '', role: '' as any, designation: '',
    division: '', phoneNumber: '', profilePicture: '', managerId: '',
    status: 'active', permissions: [], projects: []
  };
  confirmPassword.value = '';
  errors.value = {};
  successMessage.value = '';
  errorMessage.value = '';
};

const loadManagers = async () => {
  try {
    const response = await apiClient.get('/users');
    managers.value = response.data.filter((u: any) =>
      ['Manager', 'Admin', 'Super Admin'].includes(u.role)
    );
  } catch (error) {
    console.error('Error loading managers:', error);
  }
};

onMounted(() => { loadManagers(); });
</script>
