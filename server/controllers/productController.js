const Product = require('../models/Product');
const cloudinary = require('../config/cloudinary');
const APIFeatures = require('../utils/apiFeatures');

// ─── Helper: parse multipart text fields into correct types ─────────────────
const parseProductBody = (body) => {
    const parsed = { ...body };
    if (parsed.price !== undefined) parsed.price = parseFloat(parsed.price);
    if (parsed.compareAtPrice !== undefined) parsed.compareAtPrice = parsed.compareAtPrice ? parseFloat(parsed.compareAtPrice) : 0;
    if (parsed.stock !== undefined) parsed.stock = parseInt(parsed.stock, 10);
    if (parsed.isFeatured !== undefined) parsed.isFeatured = parsed.isFeatured === 'true' || parsed.isFeatured === true;
    if (parsed.isActive !== undefined) parsed.isActive = parsed.isActive === 'true' || parsed.isActive === true;
    if (parsed.tags && typeof parsed.tags === 'string') {
        try { parsed.tags = JSON.parse(parsed.tags); }
        catch { parsed.tags = parsed.tags.split(',').map(t => t.trim()).filter(Boolean); }
    }
    return parsed;
};

// ─── Helper: extract files uploaded via multer-storage-cloudinary ────────────
// CloudinaryStorage sets file.path = secure_url, file.filename = public_id
const extractFiles = (files, productName = '') => {
    const result = {};
    if (!files) return result;

    if (files.thumbnail && files.thumbnail[0]) {
        const f = files.thumbnail[0];
        result.thumbnail = f.path;          // secure_url
        result.thumbnailPublicId = f.filename; // public_id
    }

    if (files.images && files.images.length > 0) {
        result.images = files.images.map(f => ({
            url: f.path,
            publicId: f.filename,
            alt: productName,
        }));
        // If no thumbnail supplied, use first gallery image
        if (!result.thumbnail && result.images.length > 0) {
            result.thumbnail = result.images[0].url;
            result.thumbnailPublicId = result.images[0].publicId;
        }
    }

    return result;
};

// ─── Helper: delete Cloudinary assets safely ─────────────────────────────────
const destroyCloudinaryAssets = async (publicIds = []) => {
    const ids = publicIds.filter(Boolean);
    await Promise.allSettled(ids.map(id => cloudinary.uploader.destroy(id)));
};

// @desc    Get all products (paginated, filtered, sorted)
// @route   GET /api/products
exports.getProducts = async (req, res, next) => {
    try {
        const total = await Product.countDocuments({ isActive: true });
        const features = new APIFeatures(Product.find({ isActive: true }).populate('category', 'name slug'), req.query)
            .filter()
            .sort()
            .paginate()
            .selectFields();

        const products = await features.query;

        res.json({
            products,
            page: features.page,
            pages: Math.ceil(total / features.limit),
            total,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Search products with autocomplete
// @route   GET /api/products/search
exports.searchProducts = async (req, res, next) => {
    try {
        const { q, limit = 10 } = req.query;
        if (!q) return res.json([]);

        const products = await Product.find(
            { $text: { $search: q }, isActive: true },
            { score: { $meta: 'textScore' } }
        )
            .sort({ score: { $meta: 'textScore' } })
            .limit(parseInt(limit))
            .select('name slug price thumbnail rating');

        res.json(products);
    } catch (error) {
        next(error);
    }
};

// @desc    Get featured products
// @route   GET /api/products/featured
exports.getFeaturedProducts = async (req, res, next) => {
    try {
        const limit = parseInt(req.query.limit) || 8;
        const products = await Product.find({ isFeatured: true, isActive: true })
            .limit(limit)
            .populate('category', 'name slug');
        res.json(products);
    } catch (error) {
        next(error);
    }
};

// @desc    Get product by slug
// @route   GET /api/products/:slug
exports.getProductBySlug = async (req, res, next) => {
    try {
        const product = await Product.findOne({ slug: req.params.slug, isActive: true })
            .populate('category', 'name slug');

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(product);
    } catch (error) {
        next(error);
    }
};

// @desc    Create product (admin) — accepts multipart/form-data
// @route   POST /api/products
exports.createProduct = async (req, res, next) => {
    try {
        const body = parseProductBody(req.body);
        const fileData = extractFiles(req.files, body.name);

        const productData = {
            ...body,
            ...fileData,
        };

        const product = await Product.create(productData);
        res.status(201).json(product);
    } catch (error) {
        // If product creation fails after files were uploaded, clean up Cloudinary
        if (req.files) {
            const ids = [];
            if (req.files.thumbnail?.[0]) ids.push(req.files.thumbnail[0].filename);
            if (req.files.images) req.files.images.forEach(f => ids.push(f.filename));
            await destroyCloudinaryAssets(ids);
        }
        next(error);
    }
};

// @desc    Update product (admin) — accepts multipart/form-data
// @route   PUT /api/products/:id
exports.updateProduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        const body = parseProductBody(req.body);
        const fileData = extractFiles(req.files, body.name || product.name);

        // Clean up old Cloudinary assets when replaced
        if (fileData.thumbnail && product.thumbnailPublicId) {
            await destroyCloudinaryAssets([product.thumbnailPublicId]);
        }
        if (fileData.images && fileData.images.length > 0 && product.images?.length > 0) {
            const oldIds = product.images.map(img => img.publicId);
            await destroyCloudinaryAssets(oldIds);
        }

        const updated = await Product.findByIdAndUpdate(
            req.params.id,
            { ...body, ...fileData },
            { new: true, runValidators: true }
        );

        res.json(updated);
    } catch (error) {
        next(error);
    }
};

// @desc    Delete product (admin) — also deletes Cloudinary images
// @route   DELETE /api/products/:id
exports.deleteProduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        // Delete all Cloudinary assets
        const idsToDelete = [];
        if (product.thumbnailPublicId) idsToDelete.push(product.thumbnailPublicId);
        product.images?.forEach(img => { if (img.publicId) idsToDelete.push(img.publicId); });
        await destroyCloudinaryAssets(idsToDelete);

        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: 'Product deleted' });
    } catch (error) {
        next(error);
    }
};

// @desc    Upload additional images to existing product (admin)
// @route   POST /api/products/:id/images
exports.uploadImages = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        const images = req.files.map((file) => ({
            url: file.path,
            publicId: file.filename,
            alt: product.name,
        }));

        product.images.push(...images);
        if (!product.thumbnail && images.length > 0) {
            product.thumbnail = images[0].url;
            product.thumbnailPublicId = images[0].publicId;
        }

        await product.save();
        res.json(product);
    } catch (error) {
        next(error);
    }
};
