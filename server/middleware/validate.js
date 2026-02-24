const Joi = require('joi');

const validate = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            const messages = error.details.map((detail) => detail.message).join(', ');
            return res.status(400).json({ message: messages });
        }
        next();
    };
};

// Validation schemas
const schemas = {
    register: Joi.object({
        name: Joi.string().trim().min(2).max(50).required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(6).max(100).required(),
    }),
    login: Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required(),
    }),
    product: Joi.object({
        name: Joi.string().trim().max(200).required(),
        description: Joi.string().max(2000).required(),
        richDescription: Joi.string().allow(''),
        price: Joi.number().min(0).required(),
        compareAtPrice: Joi.number().min(0),
        category: Joi.string().required(),
        subcategory: Joi.string().allow(''),
        brand: Joi.string().allow(''),
        stock: Joi.number().min(0).required(),
        tags: Joi.array().items(Joi.string()),
        isFeatured: Joi.boolean(),
        variants: Joi.array().items(
            Joi.object({
                name: Joi.string().required(),
                options: Joi.array().items(
                    Joi.object({
                        label: Joi.string().required(),
                        value: Joi.string().required(),
                        stock: Joi.number().min(0),
                    })
                ),
            })
        ),
    }),
    review: Joi.object({
        product: Joi.string().required(),
        rating: Joi.number().min(1).max(5).required(),
        title: Joi.string().max(100).required(),
        comment: Joi.string().max(1000).required(),
    }),
    coupon: Joi.object({
        code: Joi.string().trim().required(),
        type: Joi.string().valid('percentage', 'fixed').required(),
        value: Joi.number().min(0).required(),
        minPurchase: Joi.number().min(0),
        maxDiscount: Joi.number().min(0).allow(null),
        usageLimit: Joi.number().min(1).allow(null),
        validFrom: Joi.date().required(),
        validUntil: Joi.date().required(),
    }),
};

module.exports = { validate, schemas };
