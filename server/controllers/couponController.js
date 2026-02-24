const Coupon = require('../models/Coupon');

// @desc    Validate coupon code
exports.validateCoupon = async (req, res, next) => {
    try {
        const { code, subtotal } = req.body;
        const coupon = await Coupon.findOne({ code: code.toUpperCase() });

        if (!coupon) return res.status(404).json({ message: 'Coupon not found' });
        if (!coupon.isValid()) return res.status(400).json({ message: 'Coupon is expired or unusable' });

        const discount = coupon.calculateDiscount(subtotal || 0);

        res.json({
            code: coupon.code,
            type: coupon.type,
            value: coupon.value,
            discount,
            minPurchase: coupon.minPurchase,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all coupons (admin)
exports.getCoupons = async (req, res, next) => {
    try {
        const coupons = await Coupon.find().sort('-createdAt');
        res.json(coupons);
    } catch (error) {
        next(error);
    }
};

// @desc    Create coupon (admin)
exports.createCoupon = async (req, res, next) => {
    try {
        const coupon = await Coupon.create(req.body);
        res.status(201).json(coupon);
    } catch (error) {
        next(error);
    }
};

// @desc    Update coupon (admin)
exports.updateCoupon = async (req, res, next) => {
    try {
        const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!coupon) return res.status(404).json({ message: 'Coupon not found' });
        res.json(coupon);
    } catch (error) {
        next(error);
    }
};

// @desc    Delete coupon (admin)
exports.deleteCoupon = async (req, res, next) => {
    try {
        await Coupon.findByIdAndDelete(req.params.id);
        res.json({ message: 'Coupon deleted' });
    } catch (error) {
        next(error);
    }
};
