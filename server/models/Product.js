const mongoose = require('mongoose');
const slugify = require('slugify');

const variantOptionSchema = new mongoose.Schema({
    label: { type: String, required: true },
    value: { type: String, required: true },
    stock: { type: Number, default: 0 },
});

const variantSchema = new mongoose.Schema({
    name: { type: String, required: true }, // e.g., "Color", "Size"
    options: [variantOptionSchema],
});

const imageSchema = new mongoose.Schema({
    url: { type: String, required: true },
    publicId: { type: String },
    alt: { type: String, default: '' },
});

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Product name is required'],
            trim: true,
            maxlength: 200,
        },
        slug: { type: String, unique: true },
        description: {
            type: String,
            required: [true, 'Description is required'],
            maxlength: 2000,
        },
        richDescription: { type: String, default: '' },
        price: {
            type: Number,
            required: [true, 'Price is required'],
            min: [0, 'Price must be positive'],
        },
        compareAtPrice: { type: Number, default: 0 },
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
            required: [true, 'Category is required'],
        },
        subcategory: { type: String },
        brand: { type: String, default: '' },
        images: [imageSchema],
        thumbnail: { type: String, default: '' },
        thumbnailPublicId: { type: String, default: '' },
        variants: [variantSchema],
        stock: { type: Number, required: true, min: 0, default: 0 },
        sold: { type: Number, default: 0 },
        rating: { type: Number, default: 0 },
        numReviews: { type: Number, default: 0 },
        tags: [{ type: String }],
        isFeatured: { type: Boolean, default: false },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

// Text index for search
productSchema.index({ name: 'text', description: 'text', tags: 'text', brand: 'text' });
productSchema.index({ category: 1, price: 1 });

// Auto-generate slug before saving
productSchema.pre('save', function (next) {
    if (this.isModified('name')) {
        this.slug = slugify(this.name, { lower: true, strict: true }) + '-' + Date.now().toString(36);
    }
    next();
});

// Virtual for discount percentage
productSchema.virtual('discountPercent').get(function () {
    if (this.compareAtPrice > this.price) {
        return Math.round(((this.compareAtPrice - this.price) / this.compareAtPrice) * 100);
    }
    return 0;
});

productSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);
