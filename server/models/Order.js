const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    image: { type: String, default: '' },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    variant: {
        name: { type: String },
        value: { type: String },
    },
});

const orderSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        orderItems: [orderItemSchema],
        shippingAddress: {
            street: { type: String, required: true },
            city: { type: String, required: true },
            state: { type: String, required: true },
            zip: { type: String, required: true },
            country: { type: String, required: true },
        },
        paymentMethod: { type: String, required: true, default: 'stripe' },
        paymentResult: {
            id: String,
            status: String,
            updateTime: String,
            emailAddress: String,
        },
        itemsPrice: { type: Number, required: true, default: 0 },
        taxPrice: { type: Number, required: true, default: 0 },
        shippingPrice: { type: Number, required: true, default: 0 },
        discountAmount: { type: Number, default: 0 },
        totalPrice: { type: Number, required: true, default: 0 },
        coupon: { type: mongoose.Schema.Types.ObjectId, ref: 'Coupon' },
        status: {
            type: String,
            enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
            default: 'pending',
        },
        isPaid: { type: Boolean, default: false },
        paidAt: Date,
        isDelivered: { type: Boolean, default: false },
        deliveredAt: Date,
        trackingNumber: { type: String },
    },
    { timestamps: true }
);

orderSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);
