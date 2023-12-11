const Product = require('../models/product');
const { cloudinary } = require('../cloudinary');
const ObjectID = require('mongoose').Types.ObjectId;

module.exports.index = async (req, res) => {
    const { category } = req.query;
    if (category) {
        const products = await Product.find({ category })
        res.render('products/index', { products, category, title: 'Category Products' });
    }
    else {
        const products = await Product.find({})
        res.render('products/index', { products, category: 'All', title: 'All Products' });
    }
};

module.exports.renderNew = (req, res) => {
    res.render('products/new', { title: 'New Product' });
};

module.exports.createProduct = async (req, res) => {
    const product = new Product(req.body.product);
    product.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    await product.save();
    req.flash('success', 'Successfully created new product!');
    res.redirect(`/products/${product._id}`);
};

module.exports.showProduct = async (req, res) => {
    if (!ObjectID.isValid(req.params.id)) {
        throw new ExpressError('Invalid Id', 500);
    }
    const product = await Product.findById(req.params.id)
    if (!product) {
        // throw new ExpressError('Invalid Product', 404);
        req.flash('error', 'Cannot find that product!')
        return res.redirect('/products');
    }
    res.render('products/show', { product, title: product.title })
};

module.exports.renderEdit = async (req, res) => {
    if (!ObjectID.isValid(req.params.id)) {
        throw new ExpressError('Invalid Id', 500);
    }
    const product = await Product.findById(req.params.id)
    if (!product) {
        // throw new ExpressError('Invalid Product', 404);
        req.flash('error', 'Cannot edit deleted product!')
        return res.redirect('/products');
    }
    res.render('products/edit', { product, title: `Update ${product.title}` });
};

module.exports.updateProduct = async (req, res) => {
    const product = await Product.findByIdAndUpdate(req.params.id, { ...req.body.product }, { runValidators: true, new: true });
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    product.images.push(...imgs);
    await product.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await product.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } });
    }
    req.flash('success', 'Successfully updated product!');
    res.redirect(`/products/${product._id}`);
};

module.exports.deleteProduct = async (req, res) => {
    await Product.findByIdAndDelete(req.params.id);
    req.flash('success', 'Successfully deleted product!')
    res.redirect('/products');
};