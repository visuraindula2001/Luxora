const router = require('express').Router();
const { createOrder, getMyOrders, getOrderById, getAllOrders, updateOrderStatus, processPayment } = require('../controllers/orderController');
const { protect } = require('../middleware/auth');
const { admin } = require('../middleware/admin');

router.post('/', protect, createOrder);
router.get('/', protect, getMyOrders);
router.get('/admin/all', protect, admin, getAllOrders);
router.get('/:id', protect, getOrderById);
router.put('/:id/status', protect, admin, updateOrderStatus);
router.post('/:id/pay', protect, processPayment);

module.exports = router;
