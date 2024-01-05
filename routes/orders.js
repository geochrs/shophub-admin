const express = require('express');
const router = express.Router();
const orders = require('../controllers/orders');

const catchAsync = require('../utils/catchAsync');

router.route('/')
    .get(catchAsync(orders.renderOrders))

module.exports = router;