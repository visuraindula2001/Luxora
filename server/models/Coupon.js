const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema(
    {
        code: {
            type: String,
            required: [true, 'Coupon code is required'],
            unique: true,
            uppercase: true,
            trim: true,
        },
        type: {
            type: String,
            enum: ['percentage', 'fixed'],
            required: true,
        },
        value: {
            type: Number,
            required: [true, 'Discount value is required'],
            min: 0,
        },
        minPurchase: { type: Number, default: 0 },
        maxDiscount: { type: Number, default: null },
        usageLimit: { type: Number, default: null },
        usedCount: { type: Number, default: 0 },
        validFrom: { type: Date, required: true },
        validUntil: { type: Date, required: true },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

// Check if coupon is valid
couponSchema.methods.isValid = function () {
    const now = new Date();
    return (
        this.isActive &&
        now >= this.validFrom &&
        now <= this.validUntil &&
        (this.usageLimit === null || this.usedCount < this.usageLimit)
    );
};

// Calculate discount
couponSchema.methods.calculateDiscount = function (subtotal) {
    if (!this.isValid()) return 0;
    if (subtotal < this.minPurchase) return 0;

    let discount = 0;
    if (this.type === 'percentage') {
        discount = (subtotal * this.value) / 100;
        if (this.maxDiscount) discount = Math.min(discount, this.maxDiscount);
    } else {
        discount = this.value;
    }

    return Math.min(discount, subtotal);
};

module.exports = mongoose.model('Coupon', couponSchema);
