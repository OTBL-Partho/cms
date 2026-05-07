const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/cmoMeterSwapController');
const { protect, hasRole } = require('../middleware/authMiddleware');

router.use(protect);
router.use(hasRole('Super Admin', 'Admin', 'Manager'));

router.get('/', ctrl.getList);
router.get('/stats', ctrl.getStats);
router.post('/auto-resolve', ctrl.autoResolve);
router.patch('/:id/status', ctrl.updateStatus);

module.exports = router;
