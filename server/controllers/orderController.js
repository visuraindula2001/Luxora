const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const sendEmail = require('../utils/sendEmail');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// @desc    Create order from cart
exports.createOrder = async (req, res, next) => {
    try {
        const { shippingAddress, paymentMethod = 'stripe' } = req.body;

        const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: 'Cart is empty' });
        }

        // Build order items and calculate prices
        const orderItems = [];
        let itemsPrice = 0;

        for (const item of cart.items) {
            if (!item.product) continue;
            if (item.product.stock < item.quantity) {
                return res.status(400).json({ message: `${item.product.name} is out of stock` });
            }

            orderItems.push({
                product: item.product._id,
                name: item.product.name,
                image: item.product.thumbnail,
                price: item.product.price,
                quantity: item.quantity,
                variant: item.variant,
            });

            itemsPrice += item.product.price * item.quantity;
        }

        // Calculate tax and shipping
        const taxPrice = Math.round(itemsPrice * 0.08 * 100) / 100; // 8% tax
        const shippingPrice = itemsPrice > 100 ? 0 : 9.99; // Free shipping over $100

        // Apply coupon discount
        let discountAmount = 0;
        if (cart.coupon) {
            const coupon = await Coupon.findById(cart.coupon);
            if (coupon && coupon.isValid()) {
                discountAmount = coupon.calculateDiscount(itemsPrice);
                coupon.usedCount += 1;
                await coupon.save();
            }
        }

        const totalPrice = Math.round((itemsPrice + taxPrice + shippingPrice - discountAmount) * 100) / 100;

        const order = await Order.create({
            user: req.user._id,
            orderItems,
            shippingAddress,
            paymentMethod,
            itemsPrice,
            taxPrice,
            shippingPrice,
            discountAmount,
            totalPrice,
            coupon: cart.coupon,
        });

        // Update product stock
        for (const item of cart.items) {
            await Product.findByIdAndUpdate(item.product._id, {
                $inc: { stock: -item.quantity, sold: item.quantity },
            });
        }

        // Clear cart
        cart.items = [];
        cart.coupon = undefined;
        await cart.save();

        // Send order confirmation email
        try {
            await sendEmail({
                to: req.user.email,
                subject: `Luxora - Order Confirmation #${order._id.toString().slice(-8).toUpperCase()}`,
                html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1a1a2e;">Order Confirmed! 🎉</h2>
            <p>Thank you for your order, ${req.user.name}!</p>
            <p><strong>Order ID:</strong> #${order._id.toString().slice(-8).toUpperCase()}</p>
            <p><strong>Total:</strong> $${order.totalPrice.toFixed(2)}</p>
            <p><strong>Items:</strong> ${order.orderItems.length}</p>
            <hr style="border: 1px solid #eee;">
            <p style="color: #666;">We'll notify you when your order ships.</p>
          </div>
        `,
            });
        } catch (emailError) {
            console.error('Email send failed:', emailError.message);
        }

        res.status(201).json(order);
    } catch (error) {
        next(error);
    }
};

// @desc    Get user's orders
exports.getMyOrders = async (req, res, next) => {
    try {
        const orders = await Order.find({ user: req.user._id }).sort('-createdAt');
        res.json(orders);
    } catch (error) {
        next(error);
    }
};

// @desc    Get order by ID
exports.getOrderById = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id).populate('user', 'name email');
        if (!order) return res.status(404).json({ message: 'Order not found' });

        // Only allow owner or admin
        if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        res.json(order);
    } catch (error) {
        next(error);
    }
};

// @desc    Get all orders (admin)
exports.getAllOrders = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const filter = {};
        if (req.query.status) filter.status = req.query.status;

        const orders = await Order.find(filter)
            .populate('user', 'name email')
            .skip(skip)
            .limit(limit)
            .sort('-createdAt');
        const total = await Order.countDocuments(filter);

        res.json({ orders, page, pages: Math.ceil(total / limit), total });
    } catch (error) {
        next(error);
    }
};

// @desc    Update order status (admin)
exports.updateOrderStatus = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        const { status, trackingNumber } = req.body;
        order.status = status;
        if (trackingNumber) order.trackingNumber = trackingNumber;

        if (status === 'delivered') {
            order.isDelivered = true;
            order.deliveredAt = new Date();
        }

        await order.save();
        res.json(order);
    } catch (error) {
        next(error);
    }
};

// @desc    Process Stripe payment
exports.processPayment = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(order.totalPrice * 100), // Stripe uses cents
            currency: 'usd',
            metadata: { orderId: order._id.toString() },
        });

        res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
        next(error);
    }
};
