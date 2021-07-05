const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const adminUserSchema = mongoose.Schema({
    userName: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        required: true,
    },
    account: {
        status: {
            type: String,
            required: true,
        },
        registeredOn: {
            type: Date,
            required: true,
        },
        lastLogin: Date,
    },
});

adminUserSchema.plugin(uniqueValidator);

module.exports = mongoose.model('Admin', adminUserSchema);