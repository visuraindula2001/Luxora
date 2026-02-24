const User = require('../models/User');
const Product = require('../models/Product');

// @desc    Get user's wishlist
exports.getWishlist = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id)
            .populate('wishlist', 'name slug price compareAtPrice thumbnail rating numReviews stock');
        res.json(user.wishlist);
    } catch (error) {
        next(error);
    }
};

// @desc    Add to wishlist
exports.addToWishlist = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.productId);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        const user = await User.findById(req.user._id);
        if (user.wishlist.includes(req.params.productId)) {
            return res.status(400).json({ message: 'Product already in wishlist' });
        }

        user.wishlist.push(req.params.productId);
        await user.save();

        res.json({ message: 'Added to wishlist' });
    } catch (error) {
        next(error);
    }
};

// @desc    Remove from wishlist
exports.removeFromWishlist = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);
        user.wishlist = user.wishlist.filter(
            (id) => id.toString() !== req.params.productId
        );
        await user.save();
        res.json({ message: 'Removed from wishlist' });
    } catch (error) {
        next(error);
    }
};
