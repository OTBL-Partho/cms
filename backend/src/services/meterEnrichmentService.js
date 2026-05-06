const { Customer, LastBillDate } = require('../models');

const toLocalDateStr = (date) => {
  const d = new Date(date);
  if (!d || isNaN(d.getTime())) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const determineHesByMeterPrefix = (meterNumber = '') => {
  const value = String(meterNumber || '');
  if (value.startsWith('90') || value.startsWith('91')) return 'L+G';
  if (value.startsWith('80') || value.startsWith('81')) return 'WASION';
  if (value.startsWith('70') || value.startsWith('71')) return 'SHENZHEN';
  return 'Unknown HES';
};

const determinePhaseByMeterPrefix = (meterNumber = '') => {
  const value = String(meterNumber || '');
  if (value.startsWith('90') || value.startsWith('80') || value.startsWith('70')) return 'E-1P';
  if (value.startsWith('91') || value.startsWith('81') || value.startsWith('71')) return 'E-3P';
  return '';
};

const determineModelByPhaseAndHes = (phase = '', hes = '') => {
  if (phase === 'E-1P' && hes === 'L+G') return 'SM110E';
  if (phase === 'E-3P' && hes === 'L+G') return 'SM310E';
  if (phase === 'E-1P' && hes === 'WASION') return 'DDSD101';
  if (phase === 'E-3P' && hes === 'WASION') return 'DTSY341';
  if (phase === 'E-1P' && hes === 'SHENZHEN') return 'DDS26D';
  if (phase === 'E-3P' && hes === 'SHENZHEN') return 'DTS27';
  return '';
};

const formatManufacturerName = (hes) => {
  if (hes === 'WASION') return 'Wasion';
  return hes;
};

const buildRemarksFromDates = (lastBillDate, replaceDate, installDate) => {
  if (!replaceDate || Number.isNaN(replaceDate.getTime())) return 'Error: Invalid Replace Date';
  if (lastBillDate) {
    if (lastBillDate > replaceDate) return 'Error: Last Bill Date is after Replace Date';
    if (lastBillDate.getTime() === replaceDate.getTime()) return 'Immediate replacement needed';
    return `Reads needed from ${toLocalDateStr(lastBillDate)} to ${toLocalDateStr(replaceDate)}`;
  }
  if (installDate instanceof Date && !Number.isNaN(installDate.getTime())) {
    return `Reads needed from ${toLocalDateStr(installDate)} to ${toLocalDateStr(replaceDate)}`;
  }
  return 'Reads needed from Install Date to Replace Date';
};

const enrichAndValidateRow = async (row) => {
  const customerId = row['Customer ID'] || row['CUSTID'] || row['CustomerID'] || row['CUST_ID'];
  const oldMeterNumber = row['Old Meter Number'] || row['OLDMETER'] || row['OldMeter'] || row['OLD_METER'];
  const newMeterNumber = row['New Meter Number'] || row['Replace Meter Number'] || row['NEWMETER'] || row['NewMeter'] || row['NEW_METER'];
  const replaceDateStr = row['Replace Date'] || row['METERCNGDATE'] || row['ReplaceDate'];
  const replaceDate = replaceDateStr ? new Date(replaceDateStr) : null;

  const validationErrors = [];
  if (!customerId) validationErrors.push('Customer ID missing');
  if (!oldMeterNumber) validationErrors.push('Old Meter Number missing');
  if (!newMeterNumber) validationErrors.push('Replace Meter Number missing');
  if (!replaceDateStr) validationErrors.push('Replace Date missing');

  const customer = customerId ? await Customer.findOne({ where: { CUSTOMER_NUM: customerId } }) : null;
  if (customerId && !customer) validationErrors.push('Customer not found');

  if (customer && oldMeterNumber && customer.METER_NO && String(customer.METER_NO) !== String(oldMeterNumber)) {
    validationErrors.push(`Meter number mismatch for customer ${customerId}`);
  }

  const lastBillDateEntry = customerId ? await LastBillDate.findOne({ where: { CUSTOMER_NUM: customerId } }) : null;
  const lastBillDate = lastBillDateEntry?.LAST_BILL_DATE ? new Date(lastBillDateEntry.LAST_BILL_DATE) : null;

  const hes = determineHesByMeterPrefix(newMeterNumber || '');
  const phase = determinePhaseByMeterPrefix(newMeterNumber || '');
  const model = determineModelByPhaseAndHes(phase, hes);
  const manufacturer = formatManufacturerName(hes);
  const netMeter = 'N';

  let remarks = buildRemarksFromDates(lastBillDate, replaceDate, customer?.CONN_DATE ? new Date(customer.CONN_DATE) : null);
  if (validationErrors.length > 0) {
    remarks = `Error: ${validationErrors.join('; ')}`;
  }

  return {
    'Customer ID': customerId,
    'Old Meter Number': oldMeterNumber || '',
    'New Meter Number': newMeterNumber || '',
    'Replace Date': replaceDateStr || '',
    installDate: customer?.CONN_DATE ? toLocalDateStr(new Date(customer.CONN_DATE)) : '',
    nocs: customer?.NOCS_NAME || '',
    tariff: customer?.TARIFF || '',
    sanctionLoad: customer?.SANCTION_LOAD || '',
    phase,
    address: customer?.ADDRESS || '',
    lastBillDate: lastBillDate ? toLocalDateStr(lastBillDate) : 'N/A',
    hes,
    model,
    manufacturer,
    netMeter,
    remarks,
  };
};

module.exports = { enrichAndValidateRow };
