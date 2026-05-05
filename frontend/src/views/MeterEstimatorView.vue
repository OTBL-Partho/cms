<template>
  <div class="me-page">

    <!-- Header -->
    <div class="me-header">
      <div class="me-header-blob1"></div>
      <div class="me-header-blob2"></div>
      <div class="me-header-inner">
        <div class="me-header-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
          </svg>
        </div>
        <div>
          <h1 class="me-header-title">Meter Reading Estimator</h1>
          <p class="me-header-sub">Calculate and export monthly meter reading estimates</p>
        </div>
      </div>
    </div>

    <!-- Tab Nav -->
    <div class="me-tab-nav">
      <button class="me-tab-btn" :class="{ active: activeTab === 'single' }" @click="activeTab = 'single'">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>
        Single Meter
      </button>
      <button class="me-tab-btn" :class="{ active: activeTab === 'bulk' }" @click="activeTab = 'bulk'">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="9" x2="15" y2="9"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
        Bulk Upload
      </button>
    </div>

    <!-- Single Meter Tab -->
    <div v-show="activeTab === 'single'">
      <div class="me-card">
        <form id="consumptionForm" class="needs-validation" novalidate @submit.prevent="handleCalculate">
          <div class="me-form-grid">
            <div class="me-form-group">
              <label class="me-label">Customer ID</label>
              <input type="text" class="me-input" id="customerId" v-model="single.customerId" required placeholder="Enter customer ID">
            </div>

            <div class="me-form-group">
              <label class="me-label">Tariff Type</label>
              <select class="me-input" id="tariffType" v-model="single.tariffType" required>
                <option value="residential">Residential</option>
                <option value="commercial">Commercial</option>
              </select>
            </div>

            <div class="me-form-group">
              <label class="me-label">Meter Number</label>
              <div class="me-input-group">
                <input type="text" class="me-input" id="meterNumber" pattern="[789]\d{7}" v-model="single.meterNumber" @input="updateMeterTypeBadge" required placeholder="8 digits starting with 7, 8, or 9">
                <span class="me-input-badge">{{ single.meterType }}</span>
              </div>
            </div>

            <div class="me-form-group">
              <label class="me-label">Billing Period</label>
              <div class="me-date-range">
                <input type="date" class="me-input" id="startDate" v-model="single.startDate" required>
                <span class="me-date-sep">to</span>
                <input type="date" class="me-input" id="endDate" v-model="single.endDate" required>
              </div>
            </div>

            <div class="me-form-group">
              <label class="me-label">Previous Reading (kWh)</label>
              <input type="number" class="me-input" id="lastReads" step="0.01" v-model.number="single.lastReads" required placeholder="0.00">
            </div>

            <div class="me-form-group" v-if="single.tariffType === 'residential'">
              <label class="me-label">Total Consumption (kWh)</label>
              <input type="number" class="me-input" id="totalConsumption" step="0.01" v-model.number="single.totalConsumption" placeholder="0.00">
            </div>
          </div>

          <!-- Commercial TOD section -->
          <div v-if="single.tariffType === 'commercial'" class="me-tod-section">
            <h5 class="me-tod-title">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              Time-of-Day (TOD) Readings
            </h5>
            <div class="me-form-grid">
              <div class="me-form-group">
                <label class="me-label">TOD1 (Off-Peak) Consumption</label>
                <input type="number" class="me-input" id="tod1Consumption" min="0" step="0.01" v-model.number="single.tod1Consumption" placeholder="0.00">
              </div>
              <div class="me-form-group">
                <label class="me-label">TOD2 (On-Peak) Consumption</label>
                <input type="number" class="me-input" id="tod2Consumption" min="0" step="0.01" v-model.number="single.tod2Consumption" placeholder="0.00">
              </div>
              <div class="me-form-group">
                <label class="me-label">Previous TOD1 Reading</label>
                <input type="number" class="me-input" id="lastReadsTOD1" step="0.01" v-model.number="single.lastReadsTOD1" placeholder="0.00">
              </div>
              <div class="me-form-group">
                <label class="me-label">Previous TOD2 Reading</label>
                <input type="number" class="me-input" id="lastReadsTOD2" step="0.01" v-model.number="single.lastReadsTOD2" placeholder="0.00">
              </div>
            </div>
          </div>

          <div class="me-actions">
            <button type="button" class="me-btn me-btn-outline" @click="resetSingleForm">Reset</button>
            <button type="submit" class="me-btn me-btn-primary">Calculate</button>
            <button type="button" class="me-btn me-btn-success" @click="exportSingleCSV">Export CSV</button>
            <button type="button" class="me-btn me-btn-danger" @click="exportSinglePDF">Export PDF</button>
          </div>
        </form>
      </div>

      <!-- Results -->
      <div class="me-card" v-if="single.results.length > 0">
        <div class="me-results-header">
          <h3 class="me-results-title">Estimation Results</h3>
          <span class="me-tariff-badge" :class="single.tariffType === 'commercial' ? 'commercial' : 'residential'">
            {{ single.tariffType === 'commercial' ? 'Commercial' : 'Residential' }}
          </span>
        </div>
        <div class="me-table-wrap">
          <table class="me-table">
            <thead>
              <tr>
                <th>Month</th>
                <th>Est. Reading</th>
                <th>Consumption</th>
                <th v-if="single.tariffType === 'commercial'">TOD1 (Off-Peak)</th>
                <th v-if="single.tariffType === 'commercial'">TOD2 (On-Peak)</th>
                <th>Days</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="result in single.results" :key="result.month">
                <td>{{ result.month }}</td>
                <td>{{ result.cumulative.toFixed(2) }}</td>
                <td>{{ result.consumption.toFixed(2) }}</td>
                <td v-if="single.tariffType === 'commercial'">{{ result.cumulativeTOD1.toFixed(2) }}<br><small class="me-small">({{ result.tod1Consumption.toFixed(2) }} kWh)</small></td>
                <td v-if="single.tariffType === 'commercial'">{{ result.cumulativeTOD2.toFixed(2) }}<br><small class="me-small">({{ result.tod2Consumption.toFixed(2) }} kWh)</small></td>
                <td>{{ result.days }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Bulk Upload Tab -->
    <div v-show="activeTab === 'bulk'">
      <div class="me-card">
        <div class="me-form-group">
          <label class="me-label">Upload CSV File</label>
          <label class="me-file-drop">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            <p>Click to upload CSV</p>
            <span>CustomerID, TariffType, MeterNumber, StartDate, EndDate, LastReading[, ...]</span>
            <input type="file" id="bulkFile" accept=".csv" @change="handleBulkFile" class="me-file-hidden">
          </label>
          <p class="me-hint"><strong>Note:</strong> For commercial meters, provide TOD1Consumption and TOD2Consumption instead of TotalConsumption</p>
        </div>
        <div class="me-actions">
          <button type="button" class="me-btn me-btn-outline" @click="resetBulkForm">Reset</button>
          <button type="button" class="me-btn me-btn-primary" @click="processBulk">Process Bulk</button>
          <button type="button" class="me-btn me-btn-success" @click="exportBulkCSV">Export All CSV</button>
          <button type="button" class="me-btn me-btn-danger" @click="exportBulkPDF">Export All PDF</button>
        </div>
      </div>

      <div class="me-card" v-if="bulk.results.length > 0">
        <h3 class="me-results-title" style="margin-bottom:1rem">Bulk Estimation Results</h3>
        <div class="me-table-wrap">
          <table class="me-table">
            <thead>
              <tr>
                <th>Customer ID</th>
                <th>Meter Number</th>
                <th>Tariff</th>
                <th>Total Consumption</th>
                <th>Months</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              <template v-for="(result, index) in bulk.results" :key="index">
                <tr>
                  <td>{{ result.customerId }}</td>
                  <td>{{ result.meterNumber }}</td>
                  <td>
                    <span class="me-tariff-badge small" :class="result.tariff === 'commercial' ? 'commercial' : 'residential'">{{ result.tariff }}</span>
                  </td>
                  <td>{{ result.totalConsumption.toFixed(2) }}</td>
                  <td>{{ result.monthlyResults.length }}</td>
                  <td>
                    <button class="me-btn me-btn-sm me-btn-outline" @click="toggleBulkDetail(index)">
                      {{ bulk.detailsVisible[index] ? 'Hide' : 'View' }}
                    </button>
                  </td>
                </tr>
                <tr v-if="bulk.detailsVisible[index]">
                  <td colspan="6" class="me-detail-cell">
                    <div class="me-detail-inner">
                      <table class="me-table me-detail-table">
                        <thead>
                          <tr>
                            <th>Month</th>
                            <th>Total</th>
                            <th>Consumption</th>
                            <th v-if="result.tariff === 'commercial'">TOD1 (Off-Peak)</th>
                            <th v-if="result.tariff === 'commercial'">TOD2 (On-Peak)</th>
                            <th>Days</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr v-for="month in result.monthlyResults" :key="month.month">
                            <td>{{ month.month }}</td>
                            <td>{{ month.cumulative.toFixed(2) }}</td>
                            <td>{{ month.consumption.toFixed(2) }}</td>
                            <td v-if="result.tariff === 'commercial'">{{ month.cumulativeTOD1.toFixed(2) }}</td>
                            <td v-if="result.tariff === 'commercial'">{{ month.cumulativeTOD2.toFixed(2) }}</td>
                            <td>{{ month.days }}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useToast } from 'vue-toastification';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import Papa from 'papaparse';

const toast = useToast();
const activeTab = ref<'single' | 'bulk'>('single');

// --- TYPE DEFINITIONS ---
interface MonthlyResult {
  month: string;
  consumption: number;
  cumulative: number;
  days: number;
  tod1Consumption: number;
  tod2Consumption: number;
  cumulativeTOD1: number;
  cumulativeTOD2: number;
}

interface SingleResultData {
  customerId: string;
  tariffType: 'residential' | 'commercial';
  meterNumber: string;
  meterType: string;
  startDate: string;
  endDate: string;
  lastReads: number;
  totalConsumption: number;
  tod1Consumption: number;
  tod2Consumption: number;
  lastReadsTOD1: number;
  lastReadsTOD2: number;
  results: MonthlyResult[];
}

interface BulkResult {
  customerId: string;
  meterNumber: string;
  tariff: 'residential' | 'commercial';
  totalConsumption: number;
  monthlyResults: MonthlyResult[];
}

const single = reactive<SingleResultData>({
  customerId: '',
  tariffType: 'residential',
  meterNumber: '',
  meterType: '?',
  startDate: '',
  endDate: '',
  lastReads: 0,
  totalConsumption: 0,
  tod1Consumption: 0,
  tod2Consumption: 0,
  lastReadsTOD1: 0,
  lastReadsTOD2: 0,
  results: [],
});

const bulk = reactive({
  file: null as File | null,
  results: [] as BulkResult[],
  detailsVisible: {} as { [key: number]: boolean },
});

const uomMap: { [key: string]: { [key: string]: { [key: string]: string } } } = {
    'L&G': {
        '1P': { total: 'ES-KWH-TOT-1P-DAILY', tod1: 'ES-KWH-TOD1-1P-DAILY', tod2: 'ES-KWH-TOD2-1P-DAILY' },
        '3P': { total: 'ES-KWH-TOT-FWD-3P-DAILY', tod1: 'ES-KWH-TOD1-FWD-3P-DAILY', tod2: 'ES-KWH-TOD2-FWD-3P-DAILY' }
    },
    'WASION': {
        '1P': { total: 'WS-KWH-TOT-1P-DAILY', tod1: 'WS-KWH-TOD1-1P-DAILY', tod2: 'WS-KWH-TOD2-1P-DAILY' },
        '3P': { total: 'WS-KWH-TOT-FWD-3P-DAILY', tod1: 'WS-KWH-TOD1-FWD-3P-DAILY', tod2: 'WS-KWH-TOD2-FWD-3P-DAILY' }
    },
    'SHENZHEN': {
        '1P': { total: 'ST-KWH-TOT-1P-DAILY', tod1: 'ST-KWH-TOD1-1P-DAILY', tod2: 'ST-KWH-TOD2-1P-DAILY' },
        '3P': { total: 'ST-KWH-TOT-FWD-3P-DAILY', tod1: 'ST-KWH-TOD1-FWD-3P-DAILY', tod2: 'ST-KWH-TOD2-FWD-3P-DAILY' }
    }
};

function updateMeterTypeBadge() {
  const prefix = single.meterNumber.charAt(0);
  const types: { [key: string]: string } = { '7': 'SHENZHEN', '8': 'WASION', '9': 'L&G' };
  single.meterType = types[prefix] || '?';
}

function getMeterPhase(meterNumber: string) {
    const secondDigit = meterNumber.charAt(1);
    return secondDigit === '0' ? '1P' : '3P';
}

function getMeterBrand(meterNumber: string) {
    const prefix = meterNumber.charAt(0);
    return prefix === '7' ? 'SHENZHEN' : prefix === '8' ? 'WASION' : 'L&G';
}

function getUOM(meterNumber: string, type = 'total') {
    const brand = getMeterBrand(meterNumber);
    const phase = getMeterPhase(meterNumber);
    return uomMap[brand][phase][type] || 'Unknown';
}

function calculateConsumption(data: Partial<SingleResultData>): MonthlyResult[] {
    const {tariffType, startDate, endDate, lastReads, totalConsumption, tod1Consumption, tod2Consumption, lastReadsTOD1, lastReadsTOD2} = data;
    if (!startDate || !endDate) throw new Error('Start and End date are required');
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start.getTime() > end.getTime()) throw new Error('End date must be after start date');

    let totalCons = 0, tod1Cons = 0, tod2Cons = 0;
    if (tariffType === 'commercial') {
        tod1Cons = tod1Consumption || 0;
        tod2Cons = tod2Consumption || 0;
        totalCons = tod1Cons + tod2Cons;
        if (totalCons <= 0) throw new Error('Total consumption must be positive');
    } else {
        totalCons = totalConsumption || 0;
        if (isNaN(totalCons)) throw new Error('Invalid consumption value');
    }

    let currentDate = new Date(start);
    const results: MonthlyResult[] = [];
    const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24)) + 1;
    const dailyConsumption = totalCons / totalDays;
    const dailyTod1 = tariffType === 'commercial' ? tod1Cons / totalDays : 0;
    const dailyTod2 = tariffType === 'commercial' ? tod2Cons / totalDays : 0;

    let cumulativeConsumption = lastReads || 0;
    let cumulativeTOD1 = lastReadsTOD1 || 0;
    let cumulativeTOD2 = lastReadsTOD2 || 0;

    while (currentDate <= end) {
        const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        const periodEnd = end < monthEnd ? end : monthEnd;
        const daysInPeriod = Math.ceil((periodEnd.getTime() - currentDate.getTime()) / (1000 * 3600 * 24)) + 1;
        const monthlyConsumption = daysInPeriod * dailyConsumption;
        cumulativeConsumption += monthlyConsumption;

        const result: MonthlyResult = {
            month: `${String(currentDate.getMonth() + 1).padStart(2, '0')}/${currentDate.getFullYear()}`,
            consumption: monthlyConsumption,
            cumulative: cumulativeConsumption,
            days: daysInPeriod,
            tod1Consumption: 0, tod2Consumption: 0, cumulativeTOD1: 0, cumulativeTOD2: 0,
        };

        if (tariffType === 'commercial') {
            const monthlyTod1 = daysInPeriod * dailyTod1;
            const monthlyTod2 = daysInPeriod * dailyTod2;
            cumulativeTOD1 += monthlyTod1;
            cumulativeTOD2 += monthlyTod2;
            result.tod1Consumption = monthlyTod1;
            result.tod2Consumption = monthlyTod2;
            result.cumulativeTOD1 = cumulativeTOD1;
            result.cumulativeTOD2 = cumulativeTOD2;
        }

        results.push(result);
        currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    }
    return results;
}

function handleCalculate() {
  try {
    single.results = calculateConsumption(single);
    toast.success('Calculation successful!');
  } catch (error: any) {
    toast.error(error.message);
  }
}

function exportSingleCSV() {
  try {
    const results = calculateConsumption(single);
    let csvContent = "METERNO,UOM,readdttm,read\n";
    if (single.tariffType === 'commercial') {
        results.forEach(result => {
            csvContent += `${single.meterNumber},${getUOM(single.meterNumber, 'total')},${result.month},${result.cumulative.toFixed(2)}\n`;
            csvContent += `${single.meterNumber},${getUOM(single.meterNumber, 'tod1')},${result.month},${result.cumulativeTOD1.toFixed(2)}\n`;
            csvContent += `${single.meterNumber},${getUOM(single.meterNumber, 'tod2')},${result.month},${result.cumulativeTOD2.toFixed(2)}\n`;
        });
    } else {
        results.forEach(result => {
            csvContent += `${single.meterNumber},${getUOM(single.meterNumber)},${result.month},${result.cumulative.toFixed(2)}\n`;
        });
    }
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `meter-readings-${Date.now()}.csv`;
    link.click();
    toast.success('CSV exported successfully');
  } catch (error: any) {
    toast.error(error.message);
  }
}

function exportSinglePDF() {
  try {
    const results = calculateConsumption(single);
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Estimation Report', 15, 15);
    doc.setFontSize(12);
    doc.text(`Customer ID: ${single.customerId}`, 15, 25);
    doc.text(`Meter Number: ${single.meterNumber}`, 15, 30);
    doc.text(`Tariff: ${single.tariffType.charAt(0).toUpperCase() + single.tariffType.slice(1)}`, 15, 35);
    doc.text(`Previous Reading: ${single.lastReads} kWh`, 15, 40);
    let startY = 50;
    if (single.tariffType === 'commercial') {
        doc.text(`TOD1 Consumption: ${single.tod1Consumption.toFixed(2)} kWh`, 15, 45);
        doc.text(`TOD2 Consumption: ${single.tod2Consumption.toFixed(2)} kWh`, 15, 50);
        startY = 60;
    }
    doc.text(`Period: ${single.startDate} to ${single.endDate}`, 15, startY - 5);
    const headers = single.tariffType === 'commercial' ?
        [["Month", "Total", "Consumption", "TOD1 (Off-Peak)", "TOD2 (On-Peak)", "Days"]] :
        [["Month", "Estimated Reading", "Consumption", "Days"]];
    const rows = results.map(r => {
        if (single.tariffType === 'commercial') {
            return [r.month, r.cumulative.toFixed(2), r.consumption.toFixed(2), r.cumulativeTOD1.toFixed(2), r.cumulativeTOD2.toFixed(2), r.days];
        } else {
            return [r.month, r.cumulative.toFixed(2), r.consumption.toFixed(2), r.days];
        }
    });
    (doc as any).autoTable({ startY, head: headers, body: rows, theme: 'grid', styles: {fontSize: 10}, headStyles: {fillColor: [99, 102, 241]} });
    doc.save(`estimation-report-${single.meterNumber}.pdf`);
    toast.success('PDF exported successfully');
  } catch (error: any) {
    toast.error(error.message);
  }
}

function resetSingleForm() {
  single.customerId = ''; single.tariffType = 'residential'; single.meterNumber = '';
  single.meterType = '?'; single.startDate = ''; single.endDate = '';
  single.lastReads = 0; single.totalConsumption = 0; single.tod1Consumption = 0;
  single.tod2Consumption = 0; single.lastReadsTOD1 = 0; single.lastReadsTOD2 = 0;
  single.results = [];
}

function handleBulkFile(event: Event) {
  const target = event.target as HTMLInputElement;
  if (target.files) bulk.file = target.files[0];
}

function processBulk() {
  if (!bulk.file) { toast.error('Please select a CSV file'); return; }
  Papa.parse(bulk.file, {
    header: true, skipEmptyLines: true,
    complete: (results) => {
      bulk.results = results.data.map((row: any) => {
        try {
          const monthlyResults = calculateConsumption({
            tariffType: row.TariffType || 'residential', startDate: row.StartDate, endDate: row.EndDate,
            lastReads: parseFloat(row.LastReading) || 0, totalConsumption: parseFloat(row.TotalConsumption) || 0,
            tod1Consumption: parseFloat(row.TOD1Consumption) || 0, tod2Consumption: parseFloat(row.TOD2Consumption) || 0,
            lastReadsTOD1: parseFloat(row.LastTOD1) || 0, lastReadsTOD2: parseFloat(row.LastTOD2) || 0,
          });
          let totalConsumption = 0;
          if (row.TariffType === 'commercial') {
            totalConsumption = (parseFloat(row.TOD1Consumption) || 0) + (parseFloat(row.TOD2Consumption) || 0);
          } else {
            totalConsumption = parseFloat(row.TotalConsumption) || 0;
          }
          return { customerId: row.CustomerID, meterNumber: row.MeterNumber, tariff: row.TariffType || 'residential', totalConsumption, monthlyResults };
        } catch (e: any) {
          toast.warning(`Skipping row for meter ${row.MeterNumber}: ${e.message}`);
          return null;
        }
      }).filter((r): r is BulkResult => r !== null);
      toast.success(`Processed ${bulk.results.length} meters successfully`);
    },
    error: (error: any) => toast.error(`Error parsing CSV: ${error.message}`)
  });
}

function toggleBulkDetail(index: number) {
  bulk.detailsVisible[index] = !bulk.detailsVisible[index];
}

function exportBulkCSV() {
  if (bulk.results.length === 0) { toast.warning('No data to export'); return; }
  let csvContent = "METERNO,UOM,readdttm,read\n";
  bulk.results.forEach(result => {
      if (result.tariff === 'commercial') {
          result.monthlyResults.forEach(month => {
              csvContent += `${result.meterNumber},${getUOM(result.meterNumber, 'total')},${month.month},${month.cumulative.toFixed(2)}\n`;
              csvContent += `${result.meterNumber},${getUOM(result.meterNumber, 'tod1')},${month.month},${month.cumulativeTOD1.toFixed(2)}\n`;
              csvContent += `${result.meterNumber},${getUOM(result.meterNumber, 'tod2')},${month.month},${month.cumulativeTOD2.toFixed(2)}\n`;
          });
      } else {
          result.monthlyResults.forEach(month => {
              csvContent += `${result.meterNumber},${getUOM(result.meterNumber)},${month.month},${month.cumulative.toFixed(2)}\n`;
          });
      }
  });
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `bulk-meter-readings-${Date.now()}.csv`;
  link.click();
  toast.success('Bulk CSV exported successfully');
}

function exportBulkPDF() {
  if (bulk.results.length === 0) { toast.warning('No data to export'); return; }
  const doc = new jsPDF();
  bulk.results.forEach((result, index) => {
      if (index > 0) doc.addPage();
      doc.setFontSize(16);
      doc.text(`Meter Report: ${result.meterNumber}`, 15, 15);
      doc.setFontSize(12);
      doc.text(`Customer ID: ${result.customerId}`, 15, 25);
      doc.text(`Tariff: ${result.tariff.charAt(0).toUpperCase() + result.tariff.slice(1)}`, 15, 30);
      let startY = 40;
      if (result.tariff === 'commercial') {
          doc.text(`TOD1: ${result.monthlyResults.reduce((acc: number, m: MonthlyResult) => acc + m.tod1Consumption, 0).toFixed(2)} kWh`, 15, 35);
          doc.text(`TOD2: ${result.monthlyResults.reduce((acc: number, m: MonthlyResult) => acc + m.tod2Consumption, 0).toFixed(2)} kWh`, 15, 40);
          startY = 50;
      }
      doc.text(`Period: ${result.monthlyResults[0].month} to ${result.monthlyResults.slice(-1)[0].month}`, 15, startY - 5);
      const headers = result.tariff === 'commercial' ?
          [["Month", "Total", "Consumption", "TOD1", "TOD2", "Days"]] :
          [["Month", "Reading", "Consumption", "Days"]];
      const rows = result.monthlyResults.map((month: MonthlyResult) => {
          if (result.tariff === 'commercial') {
              return [month.month, month.cumulative.toFixed(2), month.consumption.toFixed(2), month.cumulativeTOD1.toFixed(2), month.cumulativeTOD2.toFixed(2), month.days];
          } else {
              return [month.month, month.cumulative.toFixed(2), month.consumption.toFixed(2), month.days];
          }
      });
      (doc as any).autoTable({ startY, head: headers, body: rows, theme: 'grid', styles: { fontSize: 10 }, headStyles: { fillColor: [99, 102, 241] } });
  });
  doc.save('bulk-meter-reports.pdf');
  toast.success('Bulk PDF exported successfully');
}

function resetBulkForm() {
  bulk.file = null; bulk.results = []; bulk.detailsVisible = {};
  const bulkFileInput = document.getElementById('bulkFile') as HTMLInputElement;
  if (bulkFileInput) bulkFileInput.value = '';
}
</script>

<style scoped>
.me-page {
  max-width: 1100px;
  margin: 0 auto;
  padding: 2rem 1rem;
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Header */
.me-header {
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%);
  border-radius: 1.5rem;
  padding: 2rem;
  box-shadow: 0 20px 40px rgba(99, 102, 241, 0.25);
}
.me-header-blob1 {
  position: absolute; top: -2rem; right: -2rem;
  width: 10rem; height: 10rem;
  background: rgba(255,255,255,0.1);
  border-radius: 50%; filter: blur(1.5rem);
}
.me-header-blob2 {
  position: absolute; bottom: -2rem; left: -2rem;
  width: 8rem; height: 8rem;
  background: rgba(168,85,247,0.2);
  border-radius: 50%; filter: blur(1.5rem);
}
.me-header-inner {
  position: relative;
  display: flex;
  align-items: center;
  gap: 1rem;
}
.me-header-icon {
  width: 3rem; height: 3rem;
  background: rgba(255,255,255,0.2);
  border-radius: 0.875rem;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  backdrop-filter: blur(8px);
}
.me-header-title {
  font-size: 1.75rem;
  font-weight: 800;
  color: white;
  margin: 0 0 0.25rem 0;
  letter-spacing: -0.02em;
}
.me-header-sub {
  color: rgba(255,255,255,0.8);
  font-size: 0.875rem;
  margin: 0;
}

/* Tab Nav */
.me-tab-nav {
  display: flex;
  gap: 0.75rem;
  background: white;
  border-radius: 1rem;
  padding: 0.5rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.06);
  border: 1px solid rgba(255,255,255,0.5);
}
.me-tab-btn {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.625rem;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  color: #6b7280;
  background: transparent;
  transition: all 0.2s;
}
.me-tab-btn.active {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}
.me-tab-btn:not(.active):hover {
  background: #f3f4f6;
  color: #374151;
}

/* Card */
.me-card {
  background: rgba(255,255,255,0.85);
  backdrop-filter: blur(12px);
  border-radius: 1.25rem;
  border: 1px solid rgba(255,255,255,0.4);
  box-shadow: 0 8px 24px rgba(0,0,0,0.08);
  padding: 1.75rem;
}

/* Form */
.me-form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.25rem;
  margin-bottom: 1.25rem;
}
.me-form-group {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}
.me-label {
  font-size: 0.8125rem;
  font-weight: 600;
  color: #374151;
  letter-spacing: 0.01em;
}
.me-input {
  padding: 0.625rem 0.875rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.625rem;
  font-size: 0.875rem;
  background: white;
  color: #111827;
  transition: border-color 0.2s, box-shadow 0.2s;
  outline: none;
  width: 100%;
  box-sizing: border-box;
}
.me-input:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}
.me-input-group {
  display: flex;
}
.me-input-group .me-input {
  border-radius: 0.625rem 0 0 0.625rem;
  border-right: none;
}
.me-input-badge {
  display: flex;
  align-items: center;
  padding: 0 0.875rem;
  background: #eef2ff;
  border: 2px solid #e5e7eb;
  border-left: none;
  border-radius: 0 0.625rem 0.625rem 0;
  font-size: 0.75rem;
  font-weight: 700;
  color: #6366f1;
  white-space: nowrap;
}
.me-date-range {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.me-date-sep {
  font-size: 0.75rem;
  color: #9ca3af;
  font-weight: 500;
  white-space: nowrap;
}

/* TOD Section */
.me-tod-section {
  background: linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%);
  border-radius: 0.875rem;
  padding: 1.25rem;
  border-left: 4px solid #6366f1;
  margin-bottom: 1.25rem;
}
.me-tod-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9375rem;
  font-weight: 700;
  color: #4f46e5;
  margin: 0 0 1rem 0;
}

/* Actions */
.me-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  padding-top: 1rem;
  border-top: 1px solid #f3f4f6;
}

/* Buttons */
.me-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.625rem 1.25rem;
  border-radius: 0.625rem;
  font-weight: 600;
  font-size: 0.875rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}
.me-btn-sm { padding: 0.375rem 0.75rem; font-size: 0.8125rem; }
.me-btn-primary { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; box-shadow: 0 4px 12px rgba(99,102,241,0.3); }
.me-btn-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(99,102,241,0.4); }
.me-btn-success { background: linear-gradient(135deg, #10b981, #34d399); color: white; box-shadow: 0 4px 12px rgba(16,185,129,0.3); }
.me-btn-success:hover { transform: translateY(-1px); }
.me-btn-danger { background: linear-gradient(135deg, #ef4444, #f87171); color: white; box-shadow: 0 4px 12px rgba(239,68,68,0.3); }
.me-btn-danger:hover { transform: translateY(-1px); }
.me-btn-outline { background: transparent; color: #6366f1; border: 2px solid #c7d2fe; }
.me-btn-outline:hover { background: #eef2ff; }

/* Results */
.me-results-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}
.me-results-title { font-size: 1.125rem; font-weight: 700; color: #111827; margin: 0; }
.me-tariff-badge {
  padding: 0.375rem 1rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: capitalize;
}
.me-tariff-badge.commercial { background: linear-gradient(135deg, #10b981, #34d399); color: white; }
.me-tariff-badge.residential { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; }
.me-tariff-badge.small { padding: 0.25rem 0.75rem; font-size: 0.6875rem; }

/* Table */
.me-table-wrap { overflow-x: auto; }
.me-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}
.me-table th {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  padding: 0.75rem 1rem;
  text-align: left;
  font-weight: 700;
  font-size: 0.8125rem;
  white-space: nowrap;
}
.me-table th:first-child { border-radius: 0.625rem 0 0 0; }
.me-table th:last-child { border-radius: 0 0.625rem 0 0; }
.me-table td {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #f3f4f6;
  color: #374151;
}
.me-table tr:hover td { background: #f9fafb; }
.me-small { color: #9ca3af; font-size: 0.75em; }

/* File drop */
.me-file-drop {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  border: 2px dashed #c7d2fe;
  border-radius: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
  color: #6366f1;
  background: #f5f3ff;
  margin-bottom: 1rem;
  gap: 0.5rem;
}
.me-file-drop:hover { border-color: #6366f1; background: #ede9fe; }
.me-file-drop p { margin: 0; font-weight: 600; font-size: 0.9375rem; color: #374151; }
.me-file-drop span { font-size: 0.75rem; color: #9ca3af; }
.me-file-hidden { display: none; }
.me-hint { font-size: 0.8125rem; color: #6b7280; margin-top: 0.5rem; }

/* Detail */
.me-detail-cell { padding: 0.5rem 1rem; background: #fafafa; }
.me-detail-inner { padding: 0.75rem; background: white; border-radius: 0.625rem; }
.me-detail-table th { background: #4f46e5; }

@media (max-width: 768px) {
  .me-page { padding: 1rem 0.5rem; }
  .me-header { padding: 1.5rem; }
  .me-header-title { font-size: 1.375rem; }
  .me-form-grid { grid-template-columns: 1fr; }
  .me-actions { flex-direction: column; }
  .me-btn { width: 100%; justify-content: center; }
}
</style>
