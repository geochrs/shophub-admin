const express = require('express');
const router = express.Router();
const admins = require('../controllers/admins');

const catchAsync = require('../utils/catchAsync');

router.route('/')
    .get(catchAsync(admins.renderAdmin))
    .put(catchAsync(admins.addAdmin))
    .delete(catchAsync(admins.removeAdmin));

module.exports = router;