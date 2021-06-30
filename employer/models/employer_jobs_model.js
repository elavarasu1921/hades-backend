const mongoose = require('mongoose');

employerJobSchema = ({
    userID: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true
    },
    dates: {
        posted: {
            type: Date,
            required: true
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
        status: String,
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
    // applicants: [{
    //     userID: String,
    //     name: String,
    //     appliedOn: Date,
    //     status: String,
    //     location: String,
    //     designation: String,
    // }],
    applicants: [{
        userID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Candidate"
        },
        appliedOn: Date,
        status: String,
    }],
    apply: {
        url: String,
        email: String,
    },
    metrics: {
        applications: Number,
        views: Number,
    }
});

module.exports = mongoose.model('Job', employerJobSchema);