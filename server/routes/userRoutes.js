const router = require('express').Router();
const { getProfile, updateProfile, updateAddress, getAllUsers, deleteUser, updateUserRole, getUserById } = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { admin } = require('../middleware/admin');

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.put('/address', protect, updateAddress);

// Admin routes
router.get('/', protect, admin, getAllUsers);
router.get('/:id', protect, admin, getUserById);
router.put('/:id/role', protect, admin, updateUserRole);
router.delete('/:id', protect, admin, deleteUser);

module.exports = router;
