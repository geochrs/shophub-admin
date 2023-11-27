const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { cloudinary } = require('../cloudinary');

const ImagesSchema = new Schema({
    url: String,
    filename: String
});

ImagesSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_120');
})

const opts = { toJSON: { virtuals: true } };

const ProductSchema = new Schema({
    title: String,
    images: [ImagesSchema],
    price: Number,
    description: String,
    fullDetail: String,
    featured: Boolean,
    category: {
        type: String,
        enum: ['smartphones', 'consoles', 'games']
    }
}, opts);

ProductSchema.post('findOneAndDelete', async function (product) {
    if (product.images) {
        for (let img of product.images) {
            await cloudinary.uploader.destroy(img.filename);
        }
    }
})

const Product = mongoose.model('Product', ProductSchema);

module.exports = Product;