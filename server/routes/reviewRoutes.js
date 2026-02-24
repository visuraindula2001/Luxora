const router = require('express').Router();
const { getProductReviews, createReview, updateReview, deleteReview } = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validate');

router.get('/product/:productId', getProductReviews);
router.post('/', protect, validate(schemas.review), createReview);
router.put('/:id', protect, updateReview);
router.delete('/:id', protect, deleteReview);

module.exports = router;
