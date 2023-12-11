const baseJoi = require('joi');
const sanitizeHtml = require('sanitize-html');

const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': '{{#label}} must not include HTML!'
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                const clean = sanitizeHtml(value, {
                    allowedTags: [],
                    allowedAttributes: {},
                });
                if (clean !== value) return helpers.error('string.escapeHTML', { value })
                return clean;
            }
        }
    }
});

const Joi = baseJoi.extend(extension);

module.exports.productSchema = Joi.object({
    product: Joi.object({
        title: Joi.string().required().escapeHTML(),
        price: Joi.number().required().min(0),
        fullDetail: Joi.string().required(),
        description: Joi.string().allow(null, '').required().escapeHTML(),
        category: Joi.string().required().escapeHTML()
    }).required(),
    deleteImages: Joi.array()
});