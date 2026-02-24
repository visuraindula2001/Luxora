const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const bcrypt = require('bcryptjs');

dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

const User = require('../models/User');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');

const categories = [
    { name: 'Electronics', description: 'Smartphones, laptops, audio, and more', image: '' },
    { name: 'Fashion', description: 'Clothing, shoes, and accessories', image: '' },
    { name: 'Home & Kitchen', description: 'Furniture, decor, and kitchen essentials', image: '' },
    { name: 'Sports & Outdoors', description: 'Athletic gear, outdoor equipment', image: '' },
    { name: 'Beauty & Health', description: 'Skincare, makeup, and wellness', image: '' },
    { name: 'Books', description: 'Fiction, non-fiction, and educational', image: '' },
];

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Clear existing data
        await User.deleteMany();
        await Category.deleteMany();
        await Product.deleteMany();
        await Coupon.deleteMany();

        // Create admin user
        const adminUser = await User.create({
            name: 'Admin',
            email: 'admin@luxora.com',
            password: 'admin123',
            role: 'admin',
            isVerified: true,
        });
        console.log('👤 Admin user created (admin@luxora.com / admin123)');

        // Create test user
        await User.create({
            name: 'Test User',
            email: 'user@luxora.com',
            password: 'user123',
            role: 'user',
            isVerified: true,
        });
        console.log('👤 Test user created (user@luxora.com / user123)');

        // Create categories
        const createdCategories = await Category.create(categories);
        console.log(`📁 ${createdCategories.length} categories created`);

        // Create sample products
        const products = [
            {
                name: 'Premium Wireless Headphones',
                description: 'Experience immersive audio with active noise cancellation, 30-hour battery life, and premium comfort. Perfect for music lovers and professionals.',
                price: 299.99,
                compareAtPrice: 349.99,
                category: createdCategories[0]._id,
                brand: 'AudioPro',
                stock: 50,
                tags: ['headphones', 'wireless', 'noise-cancelling', 'audio'],
                isFeatured: true,
                images: [{ url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800', alt: 'Premium Wireless Headphones' }],
                thumbnail: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
            },
            {
                name: 'Ultra-Slim Laptop Pro 16"',
                description: 'Powerful performance in an ultra-thin design. M3 chip, 16GB RAM, 512GB SSD, stunning Retina display for creative professionals.',
                price: 1899.99,
                compareAtPrice: 2199.99,
                category: createdCategories[0]._id,
                brand: 'TechNova',
                stock: 30,
                tags: ['laptop', 'ultrabook', 'professional', 'portable'],
                isFeatured: true,
                images: [{ url: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800', alt: 'Ultra-Slim Laptop' }],
                thumbnail: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400',
            },
            {
                name: 'Smart Watch Series X',
                description: 'Advanced health monitoring, GPS tracking, and seamless connectivity. Water-resistant with 7-day battery life.',
                price: 449.99,
                compareAtPrice: 499.99,
                category: createdCategories[0]._id,
                brand: 'TechNova',
                stock: 75,
                tags: ['smartwatch', 'fitness', 'health', 'wearable'],
                isFeatured: true,
                images: [{ url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800', alt: 'Smart Watch' }],
                thumbnail: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
            },
            {
                name: 'Classic Leather Jacket',
                description: 'Timeless genuine leather jacket with a modern fit. Premium stitching and durable construction for everyday luxury.',
                price: 189.99,
                compareAtPrice: 249.99,
                category: createdCategories[1]._id,
                brand: 'UrbanEdge',
                stock: 40,
                tags: ['jacket', 'leather', 'fashion', 'outerwear'],
                isFeatured: true,
                variants: [
                    {
                        name: 'Size', options: [
                            { label: 'S', value: 'S', stock: 10 },
                            { label: 'M', value: 'M', stock: 15 },
                            { label: 'L', value: 'L', stock: 10 },
                            { label: 'XL', value: 'XL', stock: 5 },
                        ]
                    },
                    {
                        name: 'Color', options: [
                            { label: 'Black', value: '#000000', stock: 20 },
                            { label: 'Brown', value: '#8B4513', stock: 20 },
                        ]
                    },
                ],
                images: [{ url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800', alt: 'Leather Jacket' }],
                thumbnail: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400',
            },
            {
                name: 'Minimalist Running Shoes',
                description: 'Lightweight, breathable running shoes with responsive cushioning. Perfect for daily training and marathon racing.',
                price: 129.99,
                compareAtPrice: 159.99,
                category: createdCategories[3]._id,
                brand: 'Swift',
                stock: 100,
                tags: ['shoes', 'running', 'athletic', 'lightweight'],
                isFeatured: true,
                variants: [
                    {
                        name: 'Size', options: [
                            { label: '8', value: '8', stock: 20 },
                            { label: '9', value: '9', stock: 25 },
                            { label: '10', value: '10', stock: 30 },
                            { label: '11', value: '11', stock: 25 },
                        ]
                    },
                ],
                images: [{ url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800', alt: 'Running Shoes' }],
                thumbnail: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
            },
            {
                name: 'Organic Skincare Set',
                description: 'Complete skincare routine with cleanser, toner, serum, and moisturizer. 100% organic ingredients for radiant skin.',
                price: 89.99,
                compareAtPrice: 119.99,
                category: createdCategories[4]._id,
                brand: 'PureGlow',
                stock: 60,
                tags: ['skincare', 'organic', 'beauty', 'natural'],
                isFeatured: true,
                images: [{ url: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800', alt: 'Skincare Set' }],
                thumbnail: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400',
            },
            {
                name: 'Modern Coffee Table',
                description: 'Sleek mid-century modern coffee table with solid oak legs and tempered glass top. A statement piece for any living room.',
                price: 349.99,
                compareAtPrice: 449.99,
                category: createdCategories[2]._id,
                brand: 'HomeVue',
                stock: 20,
                tags: ['furniture', 'coffee-table', 'modern', 'home'],
                isFeatured: false,
                images: [{ url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800', alt: 'Coffee Table' }],
                thumbnail: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400',
            },
            {
                name: 'Wireless Earbuds Pro',
                description: 'True wireless earbuds with spatial audio, active noise cancellation, and 24-hour total battery with charging case.',
                price: 179.99,
                compareAtPrice: 219.99,
                category: createdCategories[0]._id,
                brand: 'AudioPro',
                stock: 80,
                tags: ['earbuds', 'wireless', 'audio', 'portable'],
                isFeatured: false,
                images: [{ url: 'https://images.unsplash.com/photo-1590658268037-6bf12f032f55?w=800', alt: 'Wireless Earbuds' }],
                thumbnail: 'https://images.unsplash.com/photo-1590658268037-6bf12f032f55?w=400',
            },
        ];

        const createdProducts = await Product.create(products);
        console.log(`🛍️  ${createdProducts.length} products created`);

        // Create sample coupons
        const coupons = [
            {
                code: 'WELCOME10',
                type: 'percentage',
                value: 10,
                minPurchase: 50,
                maxDiscount: 100,
                validFrom: new Date(),
                validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            },
            {
                code: 'FLAT20',
                type: 'fixed',
                value: 20,
                minPurchase: 100,
                validFrom: new Date(),
                validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
            },
        ];

        await Coupon.insertMany(coupons);
        console.log('🎟️  2 coupons created (WELCOME10, FLAT20)');

        console.log('\n✅ Database seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seed error:', error);
        process.exit(1);
    }
};

seedDB();
