const Category = require('../models/Category');
const Product = require('../models/Product');

// @desc    Get all categories
exports.getCategories = async (req, res, next) => {
    try {
        const categories = await Category.find({ isActive: true })
            .populate('parent', 'name slug')
            .sort('name');
        res.json(categories);
    } catch (error) {
        next(error);
    }
};

// @desc    Get category with products
exports.getCategoryBySlug = async (req, res, next) => {
    try {
        const category = await Category.findOne({ slug: req.params.slug });
        if (!category) return res.status(404).json({ message: 'Category not found' });
        res.json(category);
    } catch (error) {
        next(error);
    }
};

// @desc    Create category (admin)
exports.createCategory = async (req, res, next) => {
    try {
        const category = await Category.create(req.body);
        res.status(201).json(category);
    } catch (error) {
        next(error);
    }
};

// @desc    Update category (admin)
exports.updateCategory = async (req, res, next) => {
    try {
        const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!category) return res.status(404).json({ message: 'Category not found' });
        res.json(category);
    } catch (error) {
        next(error);
    }
};

// @desc    Delete category (admin)
exports.deleteCategory = async (req, res, next) => {
    try {
        const productsCount = await Product.countDocuments({ category: req.params.id });
        if (productsCount > 0) {
            return res.status(400).json({ message: `Cannot delete category with ${productsCount} products` });
        }

        await Category.findByIdAndDelete(req.params.id);
        res.json({ message: 'Category deleted' });
    } catch (error) {
        next(error);
    }
};
