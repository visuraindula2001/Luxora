const router = require('express').Router();
const {
    getProducts, searchProducts, getFeaturedProducts,
    getProductBySlug, createProduct, updateProduct,
    deleteProduct, uploadImages,
} = require('../controllers/productController');
const { protect } = require('../middleware/auth');
const { admin } = require('../middleware/admin');
const upload = require('../middleware/upload');

router.get('/', getProducts);
router.get('/search', searchProducts);
router.get('/featured', getFeaturedProducts);
router.get('/:slug', getProductBySlug);

// Admin routes — multipart/form-data (thumbnail + gallery images)
const productUpload = upload.fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'images', maxCount: 5 },
]);

router.post('/', protect, admin, productUpload, createProduct);
router.put('/:id', protect, admin, productUpload, updateProduct);
router.delete('/:id', protect, admin, deleteProduct);
router.post('/:id/images', protect, admin, upload.array('images', 5), uploadImages);

module.exports = router;
