const axios = require('axios');
const { getCmoApiToken, clearCmoToken, CMO_API_URL } = require('../services/cmoApiService');
const { Customer } = require('../models');

const handleCmoError = (res, error, fallbackMsg) => {
  console.error(`CMO MeterSwap error:`, error.response?.data || error.message);
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

    const response = await axios.get(`${CMO_API_URL}/meter-swap/list`, {
      headers: { Authorization: `Bearer ${token}` },
      params,
      timeout: 30000
    });
    return res.json(response.data);
  } catch (error) {
    return handleCmoError(res, error, 'Failed to fetch meter swap records');
  }
};

exports.getStats = async (req, res) => {
  try {
    const token = await getCmoApiToken();
    const authHeader = { Authorization: `Bearer ${token}` };
    const timeout = 15000;

    const [openRes, inProcessRes, resolvedRes] = await Promise.all([
      axios.get(`${CMO_API_URL}/meter-swap/list`, { headers: authHeader, params: { status: 'Open', limit: 1 }, timeout }),
      axios.get(`${CMO_API_URL}/meter-swap/list`, { headers: authHeader, params: { status: 'InProcess', limit: 1 }, timeout }),
      axios.get(`${CMO_API_URL}/meter-swap/list`, { headers: authHeader, params: { status: 'Resolved', limit: 1 }, timeout }),
    ]);

    const open = openRes.data?.pagination?.total || 0;
    const inProcess = inProcessRes.data?.pagination?.total || 0;
    const resolved = resolvedRes.data?.pagination?.total || 0;

    return res.json({
      success: true,
      data: { open, inProcess, resolved, total: open + inProcess + resolved }
    });
  } catch (error) {
    return handleCmoError(res, error, 'Failed to fetch meter swap stats');
  }
};

exports.autoResolve = async (req, res) => {
  try {
    const token = await getCmoApiToken();
    const authHeader = { Authorization: `Bearer ${token}` };

    // Fetch all InProcess swaps (paginate through all pages)
    let page = 1;
    const limit = 500;
    let allSwaps = [];
    while (true) {
      const response = await axios.get(`${CMO_API_URL}/meter-swap/list`, {
        headers: authHeader,
        params: { status: 'InProcess', page, limit },
        timeout: 30000
      });
      const data = response.data?.data || [];
      allSwaps = allSwaps.concat(data);
      const pagination = response.data?.pagination;
      if (!pagination || page >= pagination.totalPages) break;
      page++;
    }

    if (allSwaps.length === 0) {
      return res.json({ success: true, autoResolved: 0, checked: 0 });
    }

    // Batch fetch matching SQLite customers
    const consumerIds = [...new Set(allSwaps.map(s => String(s.OldConsumerId)).filter(Boolean))];
    const customers = await Customer.findAll({
      where: { CUSTOMER_NUM: consumerIds },
      attributes: ['CUSTOMER_NUM', 'METER_NO'],
      raw: true
    });
    const customerMap = {};
    for (const c of customers) customerMap[String(c.CUSTOMER_NUM)] = String(c.METER_NO || '');

    // Resolve matching swaps
    let autoResolved = 0;
    for (const swap of allSwaps) {
      const consumerId = String(swap.OldConsumerId || '');
      const actualMeter = String(swap.ActualMeterNumber || '');
      const sqliteMeter = customerMap[consumerId];
      if (!sqliteMeter || !actualMeter || sqliteMeter !== actualMeter) continue;
      try {
        await axios.patch(`${CMO_API_URL}/meter-swap/${swap.Id}/status`, { status: 'Resolved' }, {
          headers: authHeader,
          timeout: 15000
        });
        autoResolved++;
      } catch {
        // skip failed individual resolves, continue others
      }
    }

    const debugSample = allSwaps.slice(0, 3).map(swap => ({
      Id: swap.Id,
      OldConsumerId: swap.OldConsumerId,
      ActualMeterNumber: swap.ActualMeterNumber,
      sqliteMeter: customerMap[String(swap.OldConsumerId || '')] || null,
      allKeys: Object.keys(swap),
    }));
    console.log('[autoResolve] debug sample:', JSON.stringify(debugSample, null, 2));

    return res.json({ success: true, autoResolved, checked: allSwaps.length, debug: debugSample });
  } catch (error) {
    return handleCmoError(res, error, 'Failed to auto-resolve meter swaps');
  }
};

exports.markAllInProcess = async (req, res) => {
  try {
    const token = await getCmoApiToken();
    const authHeader = { Authorization: `Bearer ${token}` };

    // Fetch all Open swaps (paginate through all pages)
    let page = 1;
    const limit = 500;
    let allSwaps = [];
    while (true) {
      const response = await axios.get(`${CMO_API_URL}/meter-swap/list`, {
        headers: authHeader,
        params: { status: 'Open', page, limit },
        timeout: 30000
      });
      const data = response.data?.data || [];
      allSwaps = allSwaps.concat(data);
      const pagination = response.data?.pagination;
      if (!pagination || page >= pagination.totalPages) break;
      page++;
    }

    if (allSwaps.length === 0) {
      return res.json({ success: true, marked: 0 });
    }

    let marked = 0;
    for (const swap of allSwaps) {
      try {
        await axios.patch(`${CMO_API_URL}/meter-swap/${swap.Id}/status`, { status: 'InProcess' }, {
          headers: authHeader,
          timeout: 15000
        });
        marked++;
      } catch {
        // skip failed, continue others
      }
    }

    return res.json({ success: true, marked, total: allSwaps.length });
  } catch (error) {
    return handleCmoError(res, error, 'Failed to mark all swaps as InProcess');
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

    const response = await axios.patch(`${CMO_API_URL}/meter-swap/${id}/status`, { status }, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 15000
    });

    return res.json({ success: true, data: response.data?.data, message: `Status updated to ${status}` });
  } catch (error) {
    return handleCmoError(res, error, 'Failed to update swap status');
  }
};
