const Review = require('../models/Review');
const Order = require('../models/Order');

// @desc    Get product reviews
exports.getProductReviews = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const reviews = await Review.find({ product: req.params.productId })
            .populate('user', 'name avatar')
            .skip(skip)
            .limit(limit)
            .sort('-createdAt');

        const total = await Review.countDocuments({ product: req.params.productId });
        res.json({ reviews, page, pages: Math.ceil(total / limit), total });
    } catch (error) {
        next(error);
    }
};

// @desc    Create review
exports.createReview = async (req, res, next) => {
    try {
        const { product, rating, title, comment } = req.body;

        // Check if user already reviewed
        const existing = await Review.findOne({ user: req.user._id, product });
        if (existing) {
            return res.status(400).json({ message: 'You already reviewed this product' });
        }

        // Check if purchase is verified
        const order = await Order.findOne({
            user: req.user._id,
            'orderItems.product': product,
            status: 'delivered',
        });

        const review = await Review.create({
            user: req.user._id,
            product,
            rating,
            title,
            comment,
            isVerifiedPurchase: !!order,
        });

        await review.populate('user', 'name avatar');
        res.status(201).json(review);
    } catch (error) {
        next(error);
    }
};

// @desc    Update review
exports.updateReview = async (req, res, next) => {
    try {
        const review = await Review.findById(req.params.id);
        if (!review) return res.status(404).json({ message: 'Review not found' });

        if (review.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const { rating, title, comment } = req.body;
        if (rating) review.rating = rating;
        if (title) review.title = title;
        if (comment) review.comment = comment;

        await review.save();
        res.json(review);
    } catch (error) {
        next(error);
    }
};

// @desc    Delete review
exports.deleteReview = async (req, res, next) => {
    try {
        const review = await Review.findById(req.params.id);
        if (!review) return res.status(404).json({ message: 'Review not found' });

        if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await Review.findByIdAndDelete(req.params.id);
        res.json({ message: 'Review deleted' });
    } catch (error) {
        next(error);
    }
};
