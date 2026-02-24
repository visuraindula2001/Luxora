const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');

// @desc    Get dashboard statistics
exports.getStats = async (req, res, next) => {
    try {
        const totalOrders = await Order.countDocuments();
        const totalUsers = await User.countDocuments();
        const totalProducts = await Product.countDocuments();

        const revenueResult = await Order.aggregate([
            { $match: { isPaid: true } },
            { $group: { _id: null, totalRevenue: { $sum: '$totalPrice' } } },
        ]);

        const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

        // Recent orders
        const recentOrders = await Order.find()
            .populate('user', 'name email')
            .sort('-createdAt')
            .limit(5);

        // Order status distribution
        const statusDistribution = await Order.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } },
        ]);

        // Top selling products
        const topProducts = await Product.find()
            .sort('-sold')
            .limit(5)
            .select('name thumbnail price sold');

        res.json({
            totalOrders,
            totalUsers,
            totalProducts,
            totalRevenue,
            recentOrders,
            statusDistribution,
            topProducts,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get sales analytics
exports.getSalesAnalytics = async (req, res, next) => {
    try {
        const { period = '7d' } = req.query;

        let startDate;
        const now = new Date();
        switch (period) {
            case '7d': startDate = new Date(now - 7 * 24 * 60 * 60 * 1000); break;
            case '30d': startDate = new Date(now - 30 * 24 * 60 * 60 * 1000); break;
            case '90d': startDate = new Date(now - 90 * 24 * 60 * 60 * 1000); break;
            case '1y': startDate = new Date(now - 365 * 24 * 60 * 60 * 1000); break;
            default: startDate = new Date(now - 7 * 24 * 60 * 60 * 1000);
        }

        const salesData = await Order.aggregate([
            { $match: { createdAt: { $gte: startDate }, isPaid: true } },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    revenue: { $sum: '$totalPrice' },
                    orders: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ]);

        res.json(salesData);
    } catch (error) {
        next(error);
    }
};
