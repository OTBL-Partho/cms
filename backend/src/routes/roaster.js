const express = require('express');
const router = express.Router();
const { getRoaster, saveRoaster } = require('../controllers/roasterController');
const { protect, hasRole } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/',  getRoaster);
router.post('/', hasRole('Super Admin', 'Admin'), saveRoaster);

module.exports = router;
