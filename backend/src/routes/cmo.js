const express = require('express');
const router = express.Router();
const { getCMOs, getCMOStatistics, checkMDMEntry, exportCMOData, uploadCustomerInfo, getFilterOptions, multiSearchCMO, getCMOCustomerSearch } = require('../controllers/cmoController');
const { protect, hasRole } = require('../middleware/authMiddleware');

// All CMO routes require authentication
router.use(protect);

// GET /api/cmo/statistics — must be before any /:id route
router.get('/statistics', hasRole('Super Admin', 'Admin'), getCMOStatistics);

// GET /api/cmo/filter-options — distinct NOCS and CPC_CPR values for dropdowns
router.get('/filter-options', hasRole('Super Admin', 'Admin'), getFilterOptions);

// GET /api/cmo/multi-search?ids=id1,id2,... — parallel fan-out search per ID
router.get('/multi-search', hasRole('Super Admin', 'Admin'), multiSearchCMO);

// GET /api/cmo/customer-search?q=X — full customer+meter detail by customer no or meter no
router.get('/customer-search', hasRole('Super Admin', 'Admin'), getCMOCustomerSearch);

// POST /api/cmo/check-mdm-entry — check all CMO records against Customer DB
router.post('/check-mdm-entry', hasRole('Super Admin', 'Admin'), checkMDMEntry);

// POST /api/cmo/upload-customers — upload customer info from Excel
router.post('/upload-customers', hasRole('Super Admin', 'Admin'), uploadCustomerInfo);

// GET /api/cmo/export — export all CMO records with Customer data
router.get('/export', hasRole('Super Admin', 'Admin'), exportCMOData);

// GET /api/cmo — list all CMOs with filtering/pagination
router.get('/', hasRole('Super Admin', 'Admin'), getCMOs);

module.exports = router;
