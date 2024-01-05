const Order = require('../models/orders')
const User = require('../models/user')

module.exports.renderOrders = async (req, res) => {
    // const users = await User.find({})
    const orders = await Order.find({}).populate({
        path: 'user.userId',
    }).populate('user');
    res.render('orders', { orders, title: 'Orders' })
}