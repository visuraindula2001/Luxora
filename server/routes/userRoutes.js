const router = require('express').Router();
const { getProfile, updateProfile, updateAddress, getAllUsers, deleteUser } = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { admin } = require('../middleware/admin');

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.put('/address', protect, updateAddress);
router.get('/', protect, admin, getAllUsers);
router.delete('/:id', protect, admin, deleteUser);

module.exports = router;
