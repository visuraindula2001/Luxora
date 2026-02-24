const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        rating: {
            type: Number,
            required: [true, 'Rating is required'],
            min: 1,
            max: 5,
        },
        title: { type: String, required: true, maxlength: 100 },
        comment: { type: String, required: true, maxlength: 1000 },
        images: [{ type: String }],
        isVerifiedPurchase: { type: Boolean, default: false },
        helpfulVotes: { type: Number, default: 0 },
    },
    { timestamps: true }
);

// One review per user per product
reviewSchema.index({ user: 1, product: 1 }, { unique: true });
reviewSchema.index({ product: 1, createdAt: -1 });

// Static method to calculate average rating
reviewSchema.statics.calcAverageRating = async function (productId) {
    const result = await this.aggregate([
        { $match: { product: productId } },
        {
            $group: {
                _id: '$product',
                avgRating: { $avg: '$rating' },
                numReviews: { $sum: 1 },
            },
        },
    ]);

    const Product = require('./Product');
    if (result.length > 0) {
        await Product.findByIdAndUpdate(productId, {
            rating: Math.round(result[0].avgRating * 10) / 10,
            numReviews: result[0].numReviews,
        });
    } else {
        await Product.findByIdAndUpdate(productId, { rating: 0, numReviews: 0 });
    }
};

// Recalculate after save
reviewSchema.post('save', function () {
    this.constructor.calcAverageRating(this.product);
});

// Recalculate after delete
reviewSchema.post('findOneAndDelete', function (doc) {
    if (doc) doc.constructor.calcAverageRating(doc.product);
});

module.exports = mongoose.model('Review', reviewSchema);
