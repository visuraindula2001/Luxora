const router = require('express').Router();
const { getStats, getSalesAnalytics } = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { admin } = require('../middleware/admin');

router.get('/stats', protect, admin, getStats);
router.get('/sales', protect, admin, getSalesAnalytics);

module.exports = router;
