const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const employerSchema = mongoose.Schema({
    userName: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    resetPwdToken: String,
    resetPwdTokenExpDate: String,
    account: {
        emailValidationToken: String,
        emailValidationTokenExpiry: String,
        status: {
            type: String,
            default: 'EmailPendingValidation',
        },
        createdOn: {
            type: Date,
            default: Date.now(),
        },
        resumes: {
            dailyLimit: {
                type: Number,
                default: 100,
            },
            todayTotal: Number,
        },
        jobs: {
            quota: {
                type: Number,
                default: 10,
            },
            quotaUsed: Number,
            live: Number,
        },
    },
    primaryContact: {
        firstName: String,
        lastName: String,
        fullName: String,
        contactNo: String,
        designation: String,
    },
    company: {
        name: String,
        logo: String,
        url: String,
        linkedIn: String,
        location: {
            city: String,
            state: String,
            country: String,
            address: String,
            combined: String,
        },
    },
});

employerSchema.plugin(uniqueValidator);

module.exports = mongoose.model('Employer', employerSchema);