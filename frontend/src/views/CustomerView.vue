<template>
  <div class="customer-view">
    <!-- Header Section -->
    <div class="customer-header">
      <div class="header-content">
        <h1 class="page-title">
          <svg class="page-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          Customer Management
        </h1>
        <p class="page-subtitle">Search and manage customer information with bill status tracking</p>
      </div>
    </div>

    <!-- Bill Status Summary Cards -->
    <div class="status-summary" v-if="billStatusSummary.total > 0">
      <div class="summary-card bill-start">
        <div class="summary-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12,6 12,12 16,14"/>
          </svg>
        </div>
        <div class="summary-content">
          <h3>{{ billStatusSummary.billStart }}</h3>
          <p>Bill Start</p>
        </div>
      </div>
      <div class="summary-card bill-stop">
        <div class="summary-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
        </div>
        <div class="summary-content">
          <h3>{{ billStatusSummary.billStop }}</h3>
          <p>Bill Stop</p>
        </div>
      </div>
      <div class="summary-card total">
        <div class="summary-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
          </svg>
        </div>
        <div class="summary-content">
          <h3>{{ billStatusSummary.total }}</h3>
          <p>Total Customers</p>
        </div>
      </div>
    </div>

    <!-- Action Bar -->
    <div class="action-bar">
      <div class="action-group">
        <button class="btn btn-primary" @click="showUploadModal = true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7,10 12,15 17,10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Upload Customers
        </button>
        <button class="btn btn-danger" @click="deleteAllCustomers">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3,6 5,6 21,6"/>
            <path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2V6"/>
          </svg>
          Delete All
        </button>
      </div>
    </div>

    <!-- Search Section -->
    <div class="search-section">
      <div class="search-header">
        <h3>Search Customers</h3>
        <p>Enter customer numbers or meter numbers to search (comma-separated for multiple)</p>
        <div class="search-tips">
          <div class="tip-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 6v6l4 2"/>
            </svg>
            <span>Search requires at least one field to be filled</span>
          </div>
          <div class="tip-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 12l2 2 4-4"/>
            </svg>
            <span>Use commas to separate multiple numbers</span>
          </div>
        </div>
      </div>
      <div class="search-form">
        <div class="search-group">
          <label for="customer-search">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
            </svg>
            Customer Number(s)
          </label>
          <div class="input-with-icon">
            <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
            </svg>
            <input 
              type="text" 
              id="customer-search"
              class="form-control" 
              placeholder="Enter customer numbers (e.g., 12345, 67890)" 
              v-model="customerNumSearch"
              @keyup.enter="search"
            >
          </div>
        </div>
        <div class="search-group">
          <label for="meter-search">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="3"/>
              <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1"/>
            </svg>
            Meter Number(s)
          </label>
          <div class="input-with-icon">
            <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="3"/>
              <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1"/>
            </svg>
            <input 
              type="text" 
              id="meter-search"
              class="form-control" 
              placeholder="Enter meter numbers (e.g., M001, M002)" 
              v-model="meterNoSearch"
              @keyup.enter="search"
            >
          </div>
        </div>
        <div class="search-actions">
          <button class="btn btn-primary search-btn" @click="search" :disabled="!customerNumSearch && !meterNoSearch">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="M21 21l-4.35-4.35"/>
            </svg>
            Search
          </button>
          <button class="btn btn-secondary" @click="downloadCustomers" :disabled="customers.length === 0">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7,10 12,15 17,10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Download
          </button>
          <button class="btn btn-outline" @click="clearSearch">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
            Clear
          </button>
        </div>
      </div>
    </div>

    <!-- Results Section -->
    <div class="results-section" v-if="customers.length > 0">
      <div class="results-header">
        <div class="results-title">
          <h3>Search Results</h3>
          <div class="results-stats">
            <span class="stat-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
              </svg>
              {{ customers.length }} of {{ totalItems }} customers
            </span>
            <span class="stat-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12,6 12,12 16,14"/>
              </svg>
              Page {{ currentPage }} of {{ totalPages }}
            </span>
          </div>
        </div>
        <div class="results-actions">
          <button class="btn btn-sm btn-outline" @click="exportToExcel">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14,2 14,8 20,8"/>
            </svg>
            Export Excel
          </button>
        </div>
      </div>
      
      <div class="table-container">
        <table class="customers-table">
          <thead>
            <tr>
              <th>NOCS</th>
              <th>Customer #</th>
              <th>Customer Name</th>
              <th>Father Name</th>
              <th>Address</th>
              <th>Mobile</th>
              <th>Meter #</th>
              <th>Phase</th>
              <th>Tariff</th>
              <th>Last Bill Date</th>
              <th>Bill Status</th>
              <th>Connection Date</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="customer in customers" :key="customer.CUSTOMER_NUM" class="customer-row">
              <td class="nocs-num">{{ customer.NOCS_NAME }}</td>
              <td class="customer-num">{{ customer.CUSTOMER_NUM }}</td>
              <td class="customer-name">{{ customer.CUSTOMER_NAME }}</td>
              <td class="father-name">{{ customer.FATHER_NAME }}</td>
              <td class="address">{{ customer.ADDRESS }}</td>
              <td class="mobile">{{ customer.MOBILE_NO }}</td>
              <td class="meter-num">{{ customer.METER_NO }}</td>
              <td class="phase">{{ customer.PHASE }}</td>
              <td class="tariff">{{ customer.TARIFF }}</td>
              <td class="last-bill-date">{{ formatDate(customer.LAST_BILL_DATE || '') }}</td>
              <td class="bill-status">
                <span class="status-badge" :class="getStatusClass(customer.BILL_STATUS || '')">
                  {{ customer.BILL_STATUS }}
                </span>
              </td>
              <td class="conn-date">{{ formatDate(customer.CONN_DATE) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- No Results Message -->
    <div class="no-results" v-else-if="hasSearched">
      <div class="no-results-content">
        <svg class="no-results-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/>
          <path d="M21 21l-4.35-4.35"/>
        </svg>
        <h3>No customers found</h3>
        <p>Please enter customer numbers or meter numbers to search for customers.</p>
      </div>
    </div>

    <nav aria-label="Page navigation" v-if="totalPages > 1">
      <ul class="pagination justify-content-center">
        <li class="page-item" :class="{ disabled: currentPage === 1 }">
          <a class="page-link" @click="goToPage(1)">First</a>
        </li>
        <li class="page-item" :class="{ disabled: currentPage === 1 }">
          <a class="page-link" @click="goToPage(currentPage - 1)">Previous</a>
        </li>
        <li class="page-item" v-for="page in totalPages" :key="page" :class="{ active: currentPage === page }">
          <a class="page-link" @click="goToPage(page)">{{ page }}</a>
        </li>
        <li class="page-item" :class="{ disabled: currentPage === totalPages }">
          <a class="page-link" @click="goToPage(currentPage + 1)">Next</a>
        </li>
        <li class="page-item" :class="{ disabled: currentPage === totalPages }">
          <a class="page-link" @click="goToPage(totalPages)">Last</a>
        </li>
      </ul>
    </nav>

    <!-- Upload Customers Modal -->
    <div v-if="showUploadModal" style="position:fixed;inset:0;z-index:50;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.55);backdrop-filter:blur(4px);">
      <div style="background:white;border-radius:1.25rem;box-shadow:0 25px 60px -12px rgba(0,0,0,0.3);width:100%;max-width:520px;margin:1rem;overflow:hidden;">

        <!-- Header -->
        <div style="display:flex;align-items:center;justify-content:space-between;padding:1.25rem 1.5rem;background:linear-gradient(135deg,#eef2ff 0%,#f5f3ff 100%);border-bottom:1px solid #e0e7ff;">
          <div style="display:flex;align-items:center;gap:0.875rem;">
            <div style="width:2.75rem;height:2.75rem;border-radius:0.875rem;background:linear-gradient(135deg,#4f46e5,#7c3aed);display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(79,70,229,0.35);">
              <svg style="width:1.375rem;height:1.375rem;color:white;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
              </svg>
            </div>
            <div>
              <h2 style="font-size:1.0625rem;font-weight:700;color:#1e1b4b;margin:0;">Upload Customers</h2>
              <p style="font-size:0.75rem;color:#6366f1;margin:0.1rem 0 0;font-weight:500;">Direct upload · Optimised for 300,000+ rows</p>
            </div>
          </div>
          <button @click="closeUploadModal" style="color:#a5b4fc;background:none;border:none;cursor:pointer;padding:0.375rem;border-radius:0.5rem;transition:all 0.15s;" onmouseover="this.style.background='#e0e7ff';this.style.color='#4f46e5'" onmouseout="this.style.background='none';this.style.color='#a5b4fc'">
            <svg style="width:1.25rem;height:1.25rem;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <!-- Body -->
        <div style="padding:1.5rem;">

          <!-- Drop Zone (no file selected yet) -->
          <div v-if="!selectedFile"
            style="border:2px dashed #c7d2fe;border-radius:1rem;padding:2.5rem 2rem;text-align:center;background:#fafbff;transition:all 0.2s;cursor:pointer;"
            onmouseover="this.style.borderColor='#6366f1';this.style.background='#eef2ff'" onmouseout="this.style.borderColor='#c7d2fe';this.style.background='#fafbff'">
            <div style="width:3.5rem;height:3.5rem;border-radius:1rem;background:linear-gradient(135deg,#eef2ff,#ede9fe);display:flex;align-items:center;justify-content:center;margin:0 auto 1rem;">
              <svg style="width:1.875rem;height:1.875rem;color:#6366f1;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
            </div>
            <p style="font-size:0.9375rem;font-weight:700;color:#1e1b4b;margin:0 0 0.25rem;">Select your Excel file</p>
            <p style="font-size:0.8125rem;color:#94a3b8;margin:0 0 1.375rem;">No preview step — file goes straight to the database</p>
            <label style="cursor:pointer;">
              <span style="display:inline-flex;align-items:center;gap:0.5rem;padding:0.625rem 1.625rem;background:linear-gradient(135deg,#4f46e5,#7c3aed);color:white;border-radius:0.75rem;font-weight:600;font-size:0.875rem;box-shadow:0 4px 14px rgba(79,70,229,0.35);transition:opacity 0.15s;">
                <svg style="width:1rem;height:1rem;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/>
                </svg>
                Browse File
              </span>
              <input type="file" accept=".xlsx,.xls" @change="handleUploadFileSelect" style="display:none;"/>
            </label>
            <p style="font-size:0.6875rem;color:#cbd5e1;margin:0.875rem 0 0;">.xlsx · .xls</p>
          </div>

          <!-- File selected — compact info card -->
          <div v-if="selectedFile && !uploadResult" style="border:1.5px solid #c7d2fe;border-radius:1rem;overflow:hidden;">
            <div style="padding:1rem 1.25rem;background:#fafbff;display:flex;align-items:center;gap:1rem;">
              <div style="width:3rem;height:3rem;border-radius:0.75rem;background:linear-gradient(135deg,#eef2ff,#ede9fe);display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                <svg style="width:1.5rem;height:1.5rem;color:#6366f1;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
              </div>
              <div style="flex:1;min-width:0;">
                <p style="font-size:0.875rem;font-weight:700;color:#1e1b4b;margin:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">{{ uploadFileName }}</p>
                <p style="font-size:0.75rem;color:#64748b;margin:0.2rem 0 0;">{{ formatUploadFileSize(uploadFileSize) }} &nbsp;·&nbsp; Ready to upload</p>
              </div>
              <button @click="clearUploadPreview" style="padding:0.375rem;color:#94a3b8;background:#f1f5f9;border:none;border-radius:0.5rem;cursor:pointer;flex-shrink:0;" onmouseover="this.style.background='#fee2e2';this.style.color='#ef4444'" onmouseout="this.style.background='#f1f5f9';this.style.color='#94a3b8'">
                <svg style="width:0.875rem;height:0.875rem;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
            <div style="padding:0.75rem 1.25rem;background:#fffbeb;border-top:1px solid #fde68a;display:flex;align-items:flex-start;gap:0.625rem;">
              <svg style="width:0.9375rem;height:0.9375rem;color:#f59e0b;flex-shrink:0;margin-top:0.05rem;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <p style="font-size:0.75rem;color:#92400e;margin:0;line-height:1.4;">Processed in batches server-side. Existing customer numbers will be skipped automatically.</p>
            </div>
          </div>

          <!-- Result banner -->
          <div v-if="uploadResult" style="border-radius:1rem;overflow:hidden;" :style="uploadResult.success ? 'border:1.5px solid #bbf7d0;' : 'border:1.5px solid #fecaca;'">
            <!-- Result header -->
            <div style="padding:1rem 1.25rem;display:flex;align-items:center;gap:0.75rem;" :style="uploadResult.success ? 'background:#f0fdf4;' : 'background:#fef2f2;'">
              <div style="width:2.25rem;height:2.25rem;border-radius:0.625rem;display:flex;align-items:center;justify-content:center;flex-shrink:0;" :style="uploadResult.success ? 'background:#dcfce7;' : 'background:#fee2e2;'">
                <svg style="width:1.25rem;height:1.25rem;" :style="uploadResult.success ? 'color:#16a34a;' : 'color:#dc2626;'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path v-if="uploadResult.success" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <div>
                <p style="font-size:0.9375rem;font-weight:700;margin:0;" :style="uploadResult.success ? 'color:#15803d;' : 'color:#dc2626;'">
                  {{ uploadResult.success ? 'Upload Complete' : 'Upload Failed' }}
                </p>
                <p v-if="!uploadResult.success" style="font-size:0.8125rem;color:#ef4444;margin:0.15rem 0 0;">{{ uploadResult.message }}</p>
              </div>
            </div>
            <!-- Stats row -->
            <div v-if="uploadResult.success" style="padding:0.875rem 1.25rem;background:white;border-top:1px solid #e5e7eb;display:flex;gap:1.5rem;flex-wrap:wrap;">
              <div style="display:flex;align-items:center;gap:0.5rem;">
                <span style="width:0.625rem;height:0.625rem;border-radius:50%;background:#22c55e;display:inline-block;"></span>
                <span style="font-size:0.8125rem;color:#374151;">Inserted: <strong style="color:#15803d;">{{ (uploadResult.inserted ?? 0).toLocaleString() }}</strong></span>
              </div>
              <div style="display:flex;align-items:center;gap:0.5rem;">
                <span style="width:0.625rem;height:0.625rem;border-radius:50%;background:#f59e0b;display:inline-block;"></span>
                <span style="font-size:0.8125rem;color:#374151;">Skipped: <strong style="color:#b45309;">{{ (uploadResult.skipped ?? 0).toLocaleString() }}</strong></span>
              </div>
              <div style="display:flex;align-items:center;gap:0.5rem;">
                <span style="width:0.625rem;height:0.625rem;border-radius:50%;background:#6366f1;display:inline-block;"></span>
                <span style="font-size:0.8125rem;color:#374151;">Total rows: <strong style="color:#4338ca;">{{ (uploadResult.total ?? 0).toLocaleString() }}</strong></span>
              </div>
            </div>
            <!-- Errors -->
            <div v-if="uploadResult.errors?.length" style="padding:0.75rem 1.25rem;background:#fffbeb;border-top:1px solid #fde68a;max-height:80px;overflow-y:auto;">
              <p v-for="(err, i) in uploadResult.errors.slice(0, 8)" :key="i" style="font-size:0.75rem;color:#b45309;margin:0.1rem 0;">{{ err }}</p>
              <p v-if="uploadResult.errors.length > 8" style="font-size:0.75rem;color:#6b7280;margin:0.25rem 0 0;">… and {{ uploadResult.errors.length - 8 }} more</p>
            </div>
          </div>

        </div>

        <!-- Footer -->
        <div style="padding:1rem 1.5rem;border-top:1px solid #e5e7eb;background:#f9fafb;">
          <!-- Progress bar -->
          <div v-if="uploading" style="margin-bottom:1rem;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.375rem;">
              <span style="font-size:0.8125rem;color:#6366f1;font-weight:600;">{{ uploadProgress < 100 ? 'Uploading file…' : 'Processing records…' }}</span>
              <span style="font-size:0.8125rem;color:#6b7280;font-weight:700;">{{ uploadProgress }}%</span>
            </div>
            <div style="width:100%;background:#e0e7ff;border-radius:9999px;height:0.5rem;overflow:hidden;">
              <div style="background:linear-gradient(to right,#4f46e5,#7c3aed);height:100%;border-radius:9999px;transition:width 0.4s ease;" :style="{ width: `${uploadProgress}%` }"></div>
            </div>
            <p style="font-size:0.6875rem;color:#94a3b8;margin:0.375rem 0 0;">Large files are processed in batches — this may take a minute…</p>
          </div>

          <!-- Action buttons -->
          <div v-if="uploadResult" style="display:flex;justify-content:flex-end;">
            <button @click="closeUploadModal" class="btn btn-primary" style="background:linear-gradient(135deg,#4f46e5,#7c3aed);border:none;">Done</button>
          </div>
          <div v-else style="display:flex;justify-content:flex-end;gap:0.75rem;">
            <button @click="closeUploadModal" :disabled="uploading" class="btn btn-outline">Cancel</button>
            <button @click="confirmUpload" :disabled="!selectedFile || uploading" class="btn btn-primary"
              style="background:linear-gradient(135deg,#4f46e5,#7c3aed);border:none;min-width:150px;justify-content:center;">
              <svg v-if="uploading" style="width:1rem;height:1rem;animation:spin 0.8s linear infinite;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke-width="2.5" stroke-dasharray="31.4" stroke-dashoffset="10"/>
              </svg>
              <svg v-else style="width:1rem;height:1rem;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
              </svg>
              {{ uploading ? `Uploading… ${uploadProgress}%` : 'Upload Now' }}
            </button>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import apiClient from '../api';
import * as XLSX from 'xlsx';

interface Customer {
  CUSTOMER_NUM: string;
  NOCS_NAME: string;
  CUSTOMER_NAME: string;
  FATHER_NAME: string;
  ADDRESS: string;
  MOBILE_NO: string;
  SANCTION_LOAD: string;
  METER_NO: string;
  PHASE: string;
  TARIFF: string;
  CONN_DATE: string;
  FEEDER_NO: string;
  FEEDER_NAME: string;
  LAST_BILL_DATE?: string;
  BILL_STATUS?: string;
}

interface BillStatusSummary {
  billStart: number;
  billStop: number;
  total: number;
}

const customers = ref<Customer[]>([]);
const customerNumSearch = ref('');
const meterNoSearch = ref('');
const hasSearched = ref(false);

const showUploadModal = ref(false);
const uploadFileName = ref('');
const uploadFileSize = ref<number>(0);
const uploading = ref(false);
const uploadProgress = ref<number>(0);
const uploadResult = ref<{ success: boolean; inserted?: number; skipped?: number; errors?: string[]; message?: string; total?: number } | null>(null);
const selectedFile = ref<File | null>(null);
const billStatusSummary = ref<BillStatusSummary>({
  billStart: 0,
  billStop: 0,
  total: 0
});

const currentPage = ref(1);
const totalPages = ref(1);
const totalItems = ref(0);
const pageSize = ref(200); // Increased to 200 as requested

onMounted(() => {
  // Initial search when component mounts
});

const handleUploadFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (!target.files?.length) return;
  const file = target.files[0];
  selectedFile.value = file;
  uploadFileName.value = file.name;
  uploadFileSize.value = file.size;
  uploadResult.value = null;
  target.value = '';
};

const formatUploadFileSize = (bytes: number): string => {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return (bytes / Math.pow(k, i)).toFixed(1) + ' ' + sizes[i];
};

const clearUploadPreview = () => {
  uploadFileName.value = '';
  uploadFileSize.value = 0;
  uploadResult.value = null;
  uploadProgress.value = 0;
  selectedFile.value = null;
};

const closeUploadModal = () => {
  showUploadModal.value = false;
  clearUploadPreview();
};

const confirmUpload = async () => {
  if (!selectedFile.value) return;
  uploading.value = true;
  uploadProgress.value = 0;
  uploadResult.value = null;
  const formData = new FormData();
  formData.append('file', selectedFile.value);
  try {
    const response = await apiClient.post('/customers/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          uploadProgress.value = Math.round((progressEvent.loaded / progressEvent.total) * 100);
        }
      }
    });
    uploadProgress.value = 100;
    uploadResult.value = {
      success: true,
      inserted: response.data.inserted,
      skipped: response.data.skipped,
      errors: response.data.errors,
    };
  } catch (error: any) {
    console.error('Error uploading customers:', error);
    const msg = error.response?.data?.message || error.response?.data || error.message || 'Upload failed.';
    uploadResult.value = { success: false, message: msg };
  } finally {
    uploading.value = false;
  }
};

const search = async () => {
  if (!customerNumSearch.value && !meterNoSearch.value) {
    return; // Don't search if no criteria provided
  }
  
  hasSearched.value = true;
  
  try {
    const response = await apiClient.get('/customers/search', {
      params: {
        CUSTOMER_NUM: customerNumSearch.value,
        METER_NO: meterNoSearch.value,
        page: currentPage.value,
        pageSize: pageSize.value
      }
    });
    customers.value = response.data.customers;
    totalPages.value = response.data.totalPages;
    currentPage.value = response.data.currentPage;
    totalItems.value = response.data.totalItems;
    billStatusSummary.value = response.data.billStatusSummary;
  } catch (error) {
    console.error('Error searching customers:', error);
  }
};

const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
    search();
  }
};

const downloadCustomers = async () => {
  try {
    const response = await apiClient.get('/customers/search', {
      params: {
        CUSTOMER_NUM: customerNumSearch.value,
        METER_NO: meterNoSearch.value,
        page: 1, // Fetch all pages for download
        pageSize: totalPages.value * pageSize.value // Fetch all customers
      }
    });

    const customersToDownload = response.data.customers.map((customer: Customer) => ({
      ...customer,
      CONN_DATE: formatDate(customer.CONN_DATE)
    }));
    const worksheet = XLSX.utils.json_to_sheet(customersToDownload);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Customers');
    XLSX.writeFile(workbook, 'customers.xlsx');
  } catch (error) {
    console.error('Error downloading customers:', error);
  }
};

const deleteAllCustomers = async () => {
  if (confirm('Are you sure you want to delete all customers? This action cannot be undone.')) {
    try {
      await apiClient.delete('/customers');
      alert('All customers have been deleted.');
      search(); // Refresh the list
    } catch (error) {
      console.error('Error deleting customers:', error);
      alert('Error deleting customers.');
    }
  }
};

const formatDate = (dateString: string) => {
  if (!dateString) {
    return '';
  }
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: '2-digit' };
  return date.toLocaleDateString('en-GB', options);
};

const getStatusClass = (status: string) => {
  switch (status) {
    case 'Bill Start':
      return 'status-bill-start';
    case 'Bill Stop':
      return 'status-bill-stop';
    case 'No Bill Data':
      return 'status-no-data';
    default:
      return 'status-unknown';
  }
};

const clearSearch = () => {
  customerNumSearch.value = '';
  meterNoSearch.value = '';
  customers.value = [];
  hasSearched.value = false;
  billStatusSummary.value = {
    billStart: 0,
    billStop: 0,
    total: 0
  };
};

const exportToExcel = () => {
  downloadCustomers();
};
</script>

<style scoped>
/* Main Container */
.customer-view {
  padding: 2rem;
  background: var(--color-background);
  min-height: 100vh;
}

/* Header Section */
.customer-header {
  margin-bottom: 2rem;
}

.header-content {
  text-align: center;
}

.page-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: 0.5rem;
}

.page-icon {
  width: 2.5rem;
  height: 2.5rem;
  color: #4f46e5;
}

.page-subtitle {
  color: var(--color-text-secondary);
  font-size: 1.1rem;
  margin: 0;
}

/* Status Summary Cards */
.status-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.summary-card {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: transform 0.2s, box-shadow 0.2s;
}

.summary-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px -5px rgba(0, 0, 0, 0.1);
}

.summary-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.summary-card.bill-start .summary-icon {
  background: #dcfce7;
  color: #16a34a;
}

.summary-card.bill-stop .summary-icon {
  background: #fef2f2;
  color: #dc2626;
}

.summary-card.total .summary-icon {
  background: #eff6ff;
  color: #2563eb;
}

.summary-icon svg {
  width: 1.5rem;
  height: 1.5rem;
}

.summary-content h3 {
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
  color: var(--color-text);
}

.summary-content p {
  margin: 0;
  color: var(--color-text-secondary);
  font-weight: 500;
}

/* Action Bar */
.action-bar {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 4px -1px rgba(0, 0, 0, 0.1);
}

.action-group {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Search Section */
.search-section {
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 4px -1px rgba(0, 0, 0, 0.1);
}

.search-header {
  margin-bottom: 1.5rem;
}

.search-header h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 0.5rem;
}

.search-header p {
  color: var(--color-text-secondary);
  margin: 0 0 1rem 0;
}

.search-tips {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
  margin-top: 1rem;
}

.tip-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  color: #0369a1;
}

.tip-item svg {
  width: 1rem;
  height: 1rem;
  flex-shrink: 0;
}

.search-form {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 1.5rem;
  align-items: end;
}

.search-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.search-group label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  color: var(--color-text);
  margin-bottom: 0.5rem;
}

.search-group label svg {
  width: 1rem;
  height: 1rem;
  color: #4f46e5;
}

.input-with-icon {
  position: relative;
}

.input-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  width: 1.25rem;
  height: 1.25rem;
  color: var(--color-text-secondary);
  pointer-events: none;
}

.input-with-icon .form-control {
  padding-left: 2.5rem;
}

.search-actions {
  display: flex;
  gap: 0.75rem;
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
}

.btn svg {
  width: 1.25rem;
  height: 1.25rem;
}

.btn-primary {
  background: #4f46e5;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #4338ca;
}

.btn-secondary {
  background: #6b7280;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background: #4b5563;
}

.btn-danger {
  background: #dc2626;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background: #b91c1c;
}

.btn-outline {
  background: transparent;
  color: #6b7280;
  border: 1px solid #d1d5db;
}

.btn-outline:hover:not(:disabled) {
  background: #f9fafb;
  border-color: #9ca3af;
}

.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Results Section */
.results-section {
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 4px -1px rgba(0, 0, 0, 0.1);
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e5e7eb;
  gap: 1rem;
}

.results-title h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 0.5rem;
}

.results-stats {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  background: #f8fafc;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  border: 1px solid #e2e8f0;
}

.stat-item svg {
  width: 1rem;
  height: 1rem;
  color: #4f46e5;
}

.results-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

/* Table */
.table-container {
  overflow-x: auto;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
}

.customers-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.customers-table thead {
  background: #f8fafc;
}

.customers-table th {
  padding: 1rem 0.75rem;
  text-align: left;
  font-weight: 600;
  color: var(--color-text);
  border-bottom: 1px solid #e5e7eb;
  white-space: nowrap;
}

.customers-table td {
  padding: 1rem 0.75rem;
  border-bottom: 1px solid #f3f4f6;
  vertical-align: top;
}

.customer-row:hover {
  background: #f8fafc;
}

.customer-num {
  font-weight: 600;
  color: #4f46e5;
}

.customer-name {
  font-weight: 500;
  color: var(--color-text);
}

.address {
  max-width: 200px;
  word-wrap: break-word;
}

/* Status Badge */
.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.status-bill-start {
  background: #dcfce7;
  color: #16a34a;
}

.status-bill-stop {
  background: #fef2f2;
  color: #dc2626;
}

.status-no-data {
  background: #fef3c7;
  color: #d97706;
}

.status-unknown {
  background: #f3f4f6;
  color: #6b7280;
}

/* No Results */
.no-results {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  background: white;
  border-radius: 1rem;
  box-shadow: 0 2px 4px -1px rgba(0, 0, 0, 0.1);
}

.no-results-content {
  text-align: center;
}

.no-results-icon {
  width: 4rem;
  height: 4rem;
  color: var(--color-text-secondary);
  margin-bottom: 1rem;
}

.no-results-content h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 0.5rem;
}

.no-results-content p {
  color: var(--color-text-secondary);
  margin: 0;
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  gap: 0.25rem;
  margin-top: 2rem;
}

.page-item {
  list-style: none;
}

.page-link {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  background: white;
  color: var(--color-text);
  text-decoration: none;
  border-radius: 0.375rem;
  transition: all 0.2s;
  cursor: pointer;
}

.page-link:hover:not(.disabled) {
  background: #f3f4f6;
  border-color: #9ca3af;
}

.page-item.active .page-link {
  background: #4f46e5;
  color: white;
  border-color: #4f46e5;
}

.page-item.disabled .page-link {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Responsive Design */
@media (max-width: 768px) {
  .customer-view {
    padding: 1rem;
  }
  
  .search-form {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .search-actions {
    justify-content: stretch;
  }
  
  .search-actions .btn {
    flex: 1;
    justify-content: center;
  }
  
  .search-tips {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .status-summary {
    grid-template-columns: 1fr;
  }
  
  .action-group {
    flex-direction: column;
    align-items: stretch;
  }
  
  .results-header {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
  
  .results-stats {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .customers-table {
    font-size: 0.75rem;
  }
  
  .customers-table th,
  .customers-table td {
    padding: 0.5rem 0.25rem;
  }
  
  .page-title {
    font-size: 2rem;
  }
  
  .page-icon {
    width: 2rem;
    height: 2rem;
  }
}
</style>