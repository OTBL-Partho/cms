const axios = require('axios');
const { getCmoApiToken, clearCmoToken, CMO_API_URL } = require('../services/cmoApiService');
const { enrichAndValidateRow } = require('../services/meterEnrichmentService');

const handleCmoError = (res, error, fallbackMsg) => {
  console.error(`CMO MeterReplacement error:`, error.response?.data || error.message);
  if (error.response?.status === 401) clearCmoToken();
  const status = error.response?.status || 500;
  const message = error.response?.data?.message || error.message || fallbackMsg;
  return res.status(status).json({ success: false, message });
};

exports.getList = async (req, res) => {
  try {
    const token = await getCmoApiToken();
    const { page = 1, limit = 20, search, status } = req.query;
    const params = { page, limit };
    if (search) params.search = search;
    if (status) params.status = status;

    const response = await axios.get(`${CMO_API_URL}/meter-replacement/list`, {
      headers: { Authorization: `Bearer ${token}` },
      params,
      timeout: 30000
    });
    return res.json(response.data);
  } catch (error) {
    return handleCmoError(res, error, 'Failed to fetch meter replacement records');
  }
};

exports.getStats = async (req, res) => {
  try {
    const token = await getCmoApiToken();
    const authHeader = { Authorization: `Bearer ${token}` };
    const timeout = 15000;

    const [openRes, inProcessRes, resolvedRes] = await Promise.all([
      axios.get(`${CMO_API_URL}/meter-replacement/list`, { headers: authHeader, params: { status: 'Open', limit: 1 }, timeout }),
      axios.get(`${CMO_API_URL}/meter-replacement/list`, { headers: authHeader, params: { status: 'InProcess', limit: 1 }, timeout }),
      axios.get(`${CMO_API_URL}/meter-replacement/list`, { headers: authHeader, params: { status: 'Resolved', limit: 1 }, timeout }),
    ]);

    const open = openRes.data?.pagination?.total || 0;
    const inProcess = inProcessRes.data?.pagination?.total || 0;
    const resolved = resolvedRes.data?.pagination?.total || 0;

    return res.json({
      success: true,
      data: { open, inProcess, resolved, total: open + inProcess + resolved }
    });
  } catch (error) {
    return handleCmoError(res, error, 'Failed to fetch meter replacement stats');
  }
};

exports.processRecord = async (req, res) => {
  try {
    const token = await getCmoApiToken();
    const { id } = req.params;
    const { OldConsumerId, OldMeterNumber, ReplaceMeterNumber, ReplaceDate, CustomerName } = req.body;

    const enriched = await enrichAndValidateRow({
      CUSTID: OldConsumerId,
      OLDMETER: OldMeterNumber,
      NEWMETER: ReplaceMeterNumber,
      METERCNGDATE: ReplaceDate,
    });

    // Update status to InProcess in CMO API
    await axios.patch(`${CMO_API_URL}/meter-replacement/${id}/status`, { status: 'InProcess' }, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 15000
    });

    return res.json({ success: true, data: { id, customerName: CustomerName, ...enriched } });
  } catch (error) {
    return handleCmoError(res, error, 'Failed to process meter replacement record');
  }
};

exports.processAllOpen = async (req, res) => {
  try {
    const token = await getCmoApiToken();

    // Fetch all Open records (up to 500)
    const listRes = await axios.get(`${CMO_API_URL}/meter-replacement/list`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { status: 'Open', limit: 500 },
      timeout: 60000
    });

    const records = listRes.data?.data || [];
    if (records.length === 0) {
      return res.json({ success: true, data: [], message: 'No open records to process' });
    }

    const results = [];
    for (const record of records) {
      try {
        const enriched = await enrichAndValidateRow({
          CUSTID: record.OldConsumerId,
          OLDMETER: record.OldMeterNumber,
          NEWMETER: record.ReplaceMeterNumber,
          METERCNGDATE: record.ReplaceDate,
        });

        await axios.patch(`${CMO_API_URL}/meter-replacement/${record.Id}/status`, { status: 'InProcess' }, {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000
        });

        results.push({ id: record.Id, customerName: record.CustomerName, ...enriched });
      } catch (rowErr) {
        results.push({
          id: record.Id,
          customerName: record.CustomerName,
          'Customer ID': record.OldConsumerId,
          'Old Meter Number': record.OldMeterNumber,
          'New Meter Number': record.ReplaceMeterNumber,
          'Replace Date': record.ReplaceDate,
          remarks: `Error: ${rowErr.message}`,
        });
      }
    }

    return res.json({
      success: true,
      data: results,
      message: `Processed ${results.length} records`
    });
  } catch (error) {
    return handleCmoError(res, error, 'Failed to process open records');
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const token = await getCmoApiToken();
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, message: 'status is required' });
    }

    const response = await axios.patch(`${CMO_API_URL}/meter-replacement/${id}/status`, { status }, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 15000
    });

    return res.json({ success: true, data: response.data?.data, message: `Status updated to ${status}` });
  } catch (error) {
    return handleCmoError(res, error, 'Failed to update status');
  }
};
