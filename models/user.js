const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new Schema({
    email: {
        type: String,
        unique: true,
        required: true
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    address: {
        type: String,
        unique: true,
    },
    number: {
        type: Number,
        unique: true,
    },
    city: {
        type: String,
        unique: true,
    },
    zip: {
        type: Number,
        unique: true,
    }
})

UserSchema.methods.toggleIsAdmin = function () {
    this.isAdmin = !this.isAdmin;
    return this.save();
}

UserSchema.plugin(passportLocalMongoose);

const User = mongoose.model('User', UserSchema);

module.exports = User;