const User = require('../models/User');

// @desc    Get current user profile
// @route   GET /api/users/profile
exports.getProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id).populate('wishlist', 'name slug price thumbnail');
        res.json(user);
    } catch (error) {
        next(error);
    }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
exports.updateProfile = async (req, res, next) => {
    try {
        const { name, phone, avatar } = req.body;
        const user = await User.findById(req.user._id);

        if (name) user.name = name;
        if (phone) user.phone = phone;
        if (avatar) user.avatar = avatar;

        await user.save();
        res.json(user);
    } catch (error) {
        next(error);
    }
};

// @desc    Add/update address
// @route   PUT /api/users/address
exports.updateAddress = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);
        const { addressId, ...addressData } = req.body;

        if (addressData.isDefault) {
            user.addresses.forEach((addr) => (addr.isDefault = false));
        }

        if (addressId) {
            const address = user.addresses.id(addressId);
            if (address) Object.assign(address, addressData);
        } else {
            if (user.addresses.length === 0) addressData.isDefault = true;
            user.addresses.push(addressData);
        }

        await user.save();
        res.json(user.addresses);
    } catch (error) {
        next(error);
    }
};

// @desc    Get all users (admin)
// @route   GET /api/users
exports.getAllUsers = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const users = await User.find().skip(skip).limit(limit).sort('-createdAt');
        const total = await User.countDocuments();

        res.json({ users, page, pages: Math.ceil(total / limit), total });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete user (admin)
// @route   DELETE /api/users/:id
exports.deleteUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'User deleted' });
    } catch (error) {
        next(error);
    }
};
