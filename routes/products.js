const express = require('express');
const router = express.Router();
const products = require('../controllers/products');

const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, validateProduct } = require('../middleware');

const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });

router.route('/')
    .get(catchAsync(products.index))
    .post(isLoggedIn, upload.array('image'), validateProduct, catchAsync(products.createProduct))

router.get('/new', isLoggedIn, products.renderNew);

router.route('/:id')
    .get(catchAsync(products.showProduct))
    .put(isLoggedIn, upload.array('image'), validateProduct, catchAsync(products.updateProduct))
    .delete(isLoggedIn, catchAsync(products.deleteProduct));

router.get('/:id/edit', isLoggedIn, catchAsync(products.renderEdit));

module.exports = router;