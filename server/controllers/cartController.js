const Cart = require('../models/Cart');
const Product = require('../models/Product');

// @desc    Get user's cart
exports.getCart = async (req, res, next) => {
    try {
        let cart = await Cart.findOne({ user: req.user._id }).populate('items.product', 'name slug price thumbnail stock');
        if (!cart) {
            cart = await Cart.create({ user: req.user._id, items: [] });
        }
        res.json(cart);
    } catch (error) {
        next(error);
    }
};

// @desc    Add item to cart
exports.addToCart = async (req, res, next) => {
    try {
        const { productId, quantity = 1, variant } = req.body;

        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        if (product.stock < quantity) return res.status(400).json({ message: 'Insufficient stock' });

        let cart = await Cart.findOne({ user: req.user._id });
        if (!cart) {
            cart = new Cart({ user: req.user._id, items: [] });
        }

        // Check if product already in cart
        const existingIndex = cart.items.findIndex(
            (item) => item.product.toString() === productId &&
                JSON.stringify(item.variant) === JSON.stringify(variant)
        );

        if (existingIndex > -1) {
            cart.items[existingIndex].quantity += quantity;
        } else {
            cart.items.push({
                product: productId,
                quantity,
                variant,
                price: product.price,
            });
        }

        await cart.save();
        cart = await Cart.findById(cart._id).populate('items.product', 'name slug price thumbnail stock');
        res.json(cart);
    } catch (error) {
        next(error);
    }
};

// @desc    Update cart item quantity
exports.updateCartItem = async (req, res, next) => {
    try {
        const { quantity } = req.body;
        const cart = await Cart.findOne({ user: req.user._id });
        if (!cart) return res.status(404).json({ message: 'Cart not found' });

        const item = cart.items.id(req.params.itemId);
        if (!item) return res.status(404).json({ message: 'Item not found in cart' });

        if (quantity <= 0) {
            item.deleteOne();
        } else {
            item.quantity = quantity;
        }

        await cart.save();
        const updatedCart = await Cart.findById(cart._id).populate('items.product', 'name slug price thumbnail stock');
        res.json(updatedCart);
    } catch (error) {
        next(error);
    }
};

// @desc    Remove item from cart
exports.removeCartItem = async (req, res, next) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id });
        if (!cart) return res.status(404).json({ message: 'Cart not found' });

        cart.items = cart.items.filter((item) => item._id.toString() !== req.params.itemId);
        await cart.save();

        const updatedCart = await Cart.findById(cart._id).populate('items.product', 'name slug price thumbnail stock');
        res.json(updatedCart);
    } catch (error) {
        next(error);
    }
};

// @desc    Clear cart
exports.clearCart = async (req, res, next) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id });
        if (cart) {
            cart.items = [];
            cart.coupon = undefined;
            await cart.save();
        }
        res.json({ message: 'Cart cleared' });
    } catch (error) {
        next(error);
    }
};
