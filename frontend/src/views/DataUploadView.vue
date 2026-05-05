<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50 to-purple-50 p-4 md:p-6 lg:p-8">

    <!-- Header -->
    <div class="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-6 md:p-8 mb-8 shadow-2xl shadow-indigo-200">
      <div class="absolute -top-8 -right-8 w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>
      <div class="absolute -bottom-8 -left-8 w-40 h-40 bg-pink-400/20 rounded-full blur-2xl"></div>
      <div class="relative">
        <div class="flex items-center gap-3 mb-1">
          <div class="w-11 h-11 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
            <svg class="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
          </div>
          <h1 class="text-2xl md:text-3xl font-bold text-white">Data Upload</h1>
        </div>
        <p class="text-indigo-200 text-sm ml-14">Upload CSV and Excel files to update system data</p>
      </div>
    </div>

    <!-- Upload Cards Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">

      <!-- Last Bill Date -->
      <div class="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 overflow-hidden">
        <div class="bg-gradient-to-r from-indigo-500 to-indigo-600 px-5 py-4 flex items-center gap-3">
          <div class="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg class="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </div>
          <div>
            <h3 class="text-white font-bold text-sm">Last Bill Date</h3>
            <p class="text-indigo-200 text-xs">Upload billing date data</p>
          </div>
        </div>
        <div class="p-5">
          <label class="flex flex-col items-center justify-center border-2 border-dashed border-indigo-200 rounded-xl p-6 cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/30 transition-all mb-4">
            <svg class="w-8 h-8 text-indigo-300 mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            <p class="text-sm text-gray-600 font-medium">Choose CSV file</p>
            <p class="text-xs text-gray-400 mt-1">Drag & drop or click to browse</p>
            <input type="file" class="hidden" @change="handleFileUpload" accept=".csv">
          </label>
          <button @click="uploadFile" class="w-full py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white text-sm font-semibold rounded-xl hover:-translate-y-0.5 hover:shadow-lg transition-all">
            Upload Last Bill Date
          </button>
        </div>
      </div>

      <!-- Meter Replacement -->
      <div class="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 overflow-hidden">
        <div class="bg-gradient-to-r from-teal-500 to-teal-600 px-5 py-4 flex items-center gap-3">
          <div class="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg class="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="3"/><path d="M12 2v4m0 12v4m10-10h-4M6 12H2"/>
            </svg>
          </div>
          <div>
            <h3 class="text-white font-bold text-sm">Meter Replacement</h3>
            <p class="text-teal-200 text-xs">Upload meter replacement records</p>
          </div>
        </div>
        <div class="p-5">
          <MeterReplacementDataUpload />
        </div>
      </div>

      <!-- MDM Reads -->
      <div class="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 overflow-hidden">
        <div class="bg-gradient-to-r from-cyan-500 to-cyan-600 px-5 py-4 flex items-center gap-3">
          <div class="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg class="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
          </div>
          <div>
            <h3 class="text-white font-bold text-sm">MDM Reads</h3>
            <p class="text-cyan-200 text-xs">Upload meter data management reads</p>
          </div>
        </div>
        <div class="p-5">
          <label class="flex flex-col items-center justify-center border-2 border-dashed border-cyan-200 rounded-xl p-6 cursor-pointer hover:border-cyan-400 hover:bg-cyan-50/30 transition-all mb-4">
            <svg class="w-8 h-8 text-cyan-300 mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            <p class="text-sm text-gray-600 font-medium">Choose CSV file</p>
            <p class="text-xs text-gray-400 mt-1">Drag & drop or click to browse</p>
            <input type="file" class="hidden" @change="handleMdmFileUpload" accept=".csv">
          </label>
          <button @click="uploadMdmFile" class="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white text-sm font-semibold rounded-xl hover:-translate-y-0.5 hover:shadow-lg transition-all">
            Upload MDM Reads
          </button>
        </div>
      </div>

      <!-- Daily Billing Report -->
      <div class="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 overflow-hidden">
        <div class="bg-gradient-to-r from-rose-500 to-rose-600 px-5 py-4 flex items-center gap-3">
          <div class="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg class="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
              <polyline points="14,2 14,8 20,8"/>
              <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
          </div>
          <div>
            <h3 class="text-white font-bold text-sm">Daily Billing Report</h3>
            <p class="text-rose-200 text-xs">Upload Excel billing reports</p>
          </div>
        </div>
        <div class="p-5">
          <label class="flex flex-col items-center justify-center border-2 border-dashed border-rose-200 rounded-xl p-6 cursor-pointer hover:border-rose-400 hover:bg-rose-50/30 transition-all mb-4">
            <svg class="w-8 h-8 text-rose-300 mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            <p class="text-sm text-gray-600 font-medium">Choose Excel file</p>
            <p class="text-xs text-gray-400 mt-1">.xlsx or .xls format</p>
            <input type="file" class="hidden" @change="handleBillingFileUpload" accept=".xlsx, .xls">
          </label>
          <button @click="uploadBillingFile" class="w-full py-2.5 bg-gradient-to-r from-rose-500 to-rose-600 text-white text-sm font-semibold rounded-xl hover:-translate-y-0.5 hover:shadow-lg transition-all">
            Upload Billing Report
          </button>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import apiClient from '../api';
import MeterReplacementDataUpload from '@/components/MeterReplacementDataUpload.vue';

const file = ref<File | null>(null);
const mdmFile = ref<File | null>(null);
const billingFile = ref<File | null>(null);

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files) {
    file.value = target.files[0];
  }
};

const uploadFile = async () => {
  if (!file.value) {
    alert('Please select a file to upload.');
    return;
  }

  const formData = new FormData();
  formData.append('file', file.value);

  try {
    await apiClient.post('/last-bill-date/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    alert('Last bill date data uploaded successfully!');
  } catch (error) {
    console.error('Error uploading last bill date data:', error);
    alert('Error uploading last bill date data.');
  }
};

const handleMdmFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files) {
    mdmFile.value = target.files[0];
  }
};

const uploadMdmFile = async () => {
  if (!mdmFile.value) {
    alert('Please select a file to upload.');
    return;
  }

  const formData = new FormData();
  formData.append('file', mdmFile.value);

  try {
    await apiClient.post('/mdm-reads/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    alert('MDM reads data uploaded successfully!');
  } catch (error) {
    console.error('Error uploading MDM reads data:', error);
    alert('Error uploading MDM reads data.');
  }
};

const handleBillingFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files) {
    billingFile.value = target.files[0];
  }
};

const uploadBillingFile = async () => {
  if (!billingFile.value) {
    alert('Please select a file to upload.');
    return;
  }

  const formData = new FormData();
  formData.append('file', billingFile.value);

  try {
    await apiClient.post('/daily-billing-report/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    alert('Daily billing report data uploaded successfully!');
  } catch (error) {
    console.error('Error uploading daily billing report data:', error);
    alert('Error uploading daily billing report data.');
  }
};
</script>
