const axios = require('axios');
const { getCmoApiToken, clearCmoToken, CMO_API_URL } = require('../services/cmoApiService');

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
