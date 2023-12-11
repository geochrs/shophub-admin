const User = require('../models/user');

module.exports.renderAdmin = async (req, res) => {
    const users = await User.find({})
    res.render('admins', { users });
};

module.exports.addAdmin = async (req, res) => {
    const user = await User.findByIdAndUpdate({ _id: req.user._id }, { runValidators: true, new: true })
    if (user) {
        const { adminCode } = req.body;
        if (user.isAdmin) {
            req.flash('success', 'You are already an admin!')
        } else {
            if (adminCode === 'secret') {
                await user.toggleIsAdmin();
                await user.save();
                req.flash('success', 'Successfully changed role!');
            } else {
                req.flash('error', 'Please try again!')
            }
        }
    }
    res.redirect('/admins');
};

module.exports.removeAdmin = async (req, res) => {
    const user = await User.findByIdAndUpdate({ _id: req.user._id }, { runValidators: true, new: true })
    if (user) {
        await user.toggleIsAdmin();
        await user.save();
        req.flash('success', 'Successfully removed role!');
    } else {
        req.flash('error', 'Cant delete admin!')
    }
    res.redirect('/admins');
};