const router = require('express').Router();
const { validateCoupon, getCoupons, createCoupon, updateCoupon, deleteCoupon } = require('../controllers/couponController');
const { protect } = require('../middleware/auth');
const { admin } = require('../middleware/admin');
const { validate, schemas } = require('../middleware/validate');

router.post('/validate', protect, validateCoupon);
router.get('/', protect, admin, getCoupons);
router.post('/', protect, admin, validate(schemas.coupon), createCoupon);
router.put('/:id', protect, admin, updateCoupon);
router.delete('/:id', protect, admin, deleteCoupon);

module.exports = router;
