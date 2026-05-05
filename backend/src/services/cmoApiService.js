const axios = require('axios');

const CMO_API_URL = process.env.CMO_API_URL || 'http://192.168.10.100:8085/api';
const CMO_API_USERNAME = process.env.CMO_API_USERNAME;
const CMO_API_PASSWORD = process.env.CMO_API_PASSWORD;

let cachedToken = null;
let tokenExpiry = null;
let loginPromise = null;

const getCmoApiToken = async () => {
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry - 5 * 60 * 1000) {
    return cachedToken;
  }
  if (loginPromise) return loginPromise;

  loginPromise = (async () => {
    try {
      const response = await axios.post(`${CMO_API_URL}/auth/login`, {
        username: CMO_API_USERNAME,
        password: CMO_API_PASSWORD
      });
      if (response.data.success && response.data.data.accessToken) {
        cachedToken = response.data.data.accessToken;
        tokenExpiry = Date.now() + 23 * 60 * 60 * 1000;
        return cachedToken;
      }
      throw new Error('Failed to obtain CMO API token - no accessToken in response');
    } catch (error) {
      console.error('CMO API login error:', error.response?.data || error.message);
      cachedToken = null;
      tokenExpiry = null;
      throw new Error(`Failed to authenticate with CMO API: ${error.response?.data?.message || error.message}`);
    } finally {
      loginPromise = null;
    }
  })();

  return loginPromise;
};

const clearCmoToken = () => {
  cachedToken = null;
  tokenExpiry = null;
};

module.exports = { CMO_API_URL, getCmoApiToken, clearCmoToken };
