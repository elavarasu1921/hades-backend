const mongoose = require('mongoose');

const employerJobSchema = ({
    userID: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    dates: {
        posted: {
            type: Date,
            default: Date.now(),
        },
        edited: Date,
        start: Date,
        expiry: Date,
    },
    contact: {
        name: String,
        no: Number,
        email: String,
    },
    info: {
        expRange: String,
        domain: String,
        salRange: String,
        designation: String,
        jobType: String,
        client: String,
        company: String,
        status: {
            type: String,
            default: 'Submitted',
        },
    },
    skills: Array,
    description: {
        type: String,
        required: true,
    },
    qualification: String,
    location: {
        city: String,
        state: String,
        country: String,
        combined: String,
    },
    applicants: [{
        userID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Candidate',
        },
        appliedOn: Date,
        status: String,
    }],
    applicants_count: {
        type: Number,
        default: 0,
    },
    apply: {
        url: String,
        email: String,
    },
    metrics: {
        applications: Number,
        views: Number,
    },
});

module.exports = mongoose.model('Job', employerJobSchema);