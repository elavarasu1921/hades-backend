const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const candidateSchema = mongoose.Schema({
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
    resetPwdTokenExpDate: Date,
    account: {
        emailValidationToken: String,
        emailValidationTokenExpiry: String,
        status: String,
        date: {
            createdOn: {
                type: Date,
                default: Date.now
            },
            lastViewed: Date,
            lastUpdated: Date,
        },
        visibility: String,
    },
    personalInfo: {
        name: {
            fullName: String,
            firstName: String,
            lastName: String,
        },
        contact: {
            no: String,
            skypeID: String,
        },
        location: {
            city: String,
            state: String,
            country: String,
            combined: String,
        },
        relocation: Boolean,
        gender: String,
        phyDisabled: Boolean,
        maritalStatus: String,
        socialMedia: {
            linkedIn: String,
        },
        experience: Number,
        profileImgUrl: String,
    },
    resume: {
        originalUrl: String,
        convertedUrl: String,
        savedName: String,
        originalName: String,
        mimeType: String,
    },
    language: [{
        name: String,
        proficiency: String,
        read: Boolean,
        write: Boolean,
        speak: Boolean
    }],
    educationalInfo: {
        ugDegree: {
            degree: String,
            university: String,
            college: String,
            educationType: String,
            specialization: String,
            YOG: Number,
        },
        pgDegree: {
            degree: String,
            university: String,
            college: String,
            educationType: String,
            specialization: String,
            YOG: Number,
        },
        certification: {
            one: {
                name: String,
                institute: String,
                year: Number,
            },
            two: {
                name: String,
                institute: String,
                year: Number,
            }
        }
    },
    professionalInfo: {
        profileTitle: String,
        coverLetter: String,
        relocation: String,
        domain: String,
        current: {
            designation: String,
            company: String,
            salary: String,
        },
        expected: {
            designation: String,
            salary: String,
            cities: Array,
        },
        domain: String,
        noticePeriod: String,
        skillsList: Array,
        skills: [{
            name: String,
            lastUsed: Number,
            yrsUsed: Number,
            proficiency: String,
        }],
    },
    jobs: {
        applied: [{
            jobID: String,
            appliedOn: String,
        }],
        saved: [{
            jobID: String,
            appliedOn: Date,
        }],
    }
});

candidateSchema.plugin(uniqueValidator);

module.exports = mongoose.model("Candidate", candidateSchema);