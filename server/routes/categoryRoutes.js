const router = require('express').Router();
const { getCategories, getCategoryBySlug, createCategory, updateCategory, deleteCategory } = require('../controllers/categoryController');
const { protect } = require('../middleware/auth');
const { admin } = require('../middleware/admin');

router.get('/', getCategories);
router.get('/:slug', getCategoryBySlug);
router.post('/', protect, admin, createCategory);
router.put('/:id', protect, admin, updateCategory);
router.delete('/:id', protect, admin, deleteCategory);

module.exports = router;
