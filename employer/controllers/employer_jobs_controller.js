const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Jobs = require('../models/employer_jobs_model')
const {
    createJobsValidation,
    getMyJobsValidation
} = require('../validation/employer_jobs_validation');
const Lookup = require('../models/employer_lookup_model');

const THIRTY_DAYS_IN_MILLISECONDS = 2592000000;

exports.employerJobsCreate = async (req, res, next) => {

    let createdJob = {
        title: req.body.title,
        userID: req.body.userID,
        dates: {
            posted: Date.now(),
        },
        contact: {
            name: req.body.contactName,
            no: req.body.contactNo,
            email: req.body.contactEmail,
        },
        info: {
            skills: req.body.skills,
            expRange: req.body.exprange,
            domain: req.body.domain,
            expRange: req.body.exprange,
            salRange: req.body.salary,
            designation: req.body.designation,
            jobType: req.body.jobType,
            client: req.body.client,
            company: req.body.company,
            status: 'Submitted',
        },
        apply: {
            url: req.body.applyUrl,
        },
        description: req.body.description,
        qualification: req.body.qualification,
        location: {
            combined: req.body.location,
            country: req.body.country,
        }
    }

    const result = createJobsValidation(createdJob);

    if (result.fails()) {
        console.log(result.errors.all());
        res.status(400).json({
            errMessage: 'Validation Error'
        })
    }

    const job = new Jobs(createdJob);

    let resp = await job.save();

    if (resp.nModified = 0) {
        console.log(resp);
        res.status(400).json({
            errorMsg: 'Not able to save job',
        })
        return;
    }
    res.status(200).json({
        successMsg: 'Job Successfully Saved...',
        data: resp,
    })

}

exports.employerMyJobsList = async (req, res, next) => {
    let reqData = {
        userID: mongoose.Types.ObjectId(req.body.userID),
        currentPage: +req.query.currentPage,
        itemsPerPage: +req.query.itemsPerPage
    }
    const result = getMyJobsValidation(reqData);
    if (result.fails()) {
        console.log('Data Missing');
        res.status(400).json({
            errMessage: 'Data Missing'
        })
        return;
    };
    const {
        userID,
        currentPage,
        itemsPerPage
    } = reqData;
    let totalJobs = await Jobs.find({
            userID
        })
        .countDocuments()

    let fetchedJobs = await Jobs.find({
            userID
        })
        .select('title dates.posted dates.expiry info.status metrics.applications')
        .skip((currentPage - 1) * itemsPerPage)
        .limit(itemsPerPage)

    if (fetchedJobs.length == 0) {
        res.status(200).json({
            successMsg: 'No Posts found...',
        })
        return;
    };
    let createdJobs = fetchedJobs.map(ele => {
        const tempJob = {};
        tempJob['title'] = ele.title;
        tempJob['_id'] = ele._id;
        tempJob['status'] = ele.info.status;
        tempJob['postedDate'] = ele.dates.posted;
        tempJob['expiryDate'] = ele.dates.expiry;
        tempJob['applications'] = ele.metrics.applications;
        return tempJob;
    });
    res.status(200).json({
        successMsg: 'Posts Successfully Retrieved...',
        data: createdJobs,
        totalJobs,
        hasNextPage: (itemsPerPage * currentPage) < totalJobs,
        hasPreviousPage: currentPage > 1,
        previousPage: currentPage - 1,
        nextPage: +currentPage + 1,
        lastPage: Math.ceil(totalJobs / itemsPerPage),
    })
}

exports.employerAllJobsList = (req, res, next) => {
    // Need to add filter by user ID
    Jobs.find()
        .then(resp => {
            res.status(200).json({
                successMsg: 'Posts Successfully Retrieved...',
                data: resp
            })
        })
        .catch(err => {
            console.log(err);
            res.status(400).json({
                errMessage: 'Data finding error...'
            })
        })
}

exports.employerJobDelete = async (req, res, next) => {

    reqData = {
        userID: req.body.userID,
        jobID: mongoose.Types.ObjectId(req.query.jobID),
    }
    const {
        userID,
        jobID
    } = reqData;
    if (!(userID && jobID)) {
        res.status(400).json({
            errMessage: 'Data Missing'
        })
        return;
    }
    let resp = await Jobs.deleteOne({
        userID,
        _id: jobID
    });
    if (resp.nModified == 1) {
        res.status(200).json({
            successMsg: 'Job Deleted'
        })
        return;
    }
    res.status(400).json({
        errMessage: 'No Job found'
    })
}

exports.employerPostJobsLookup = async (req, res, next) => {

    let fetchedLookups = await Lookup.find({
            name: {
                $in: ['location', 'designation', 'exprange', 'skill']
            }
        })
        .select('name value bdvalue -_id')

    function groupBy(arr, property) {
        return arr.reduce(function (memo, x) {
            if (!memo[x[property]]) {
                memo[x[property]] = [];
            }
            memo[x[property]].push(x);
            return memo;
        }, {});
    }

    let brokenArrays = groupBy(fetchedLookups, 'name');
    res.status(200).json(brokenArrays);

}

exports.employerGetOneJob = async (req, res, next) => {

    let jobID = mongoose.Types.ObjectId(req.body.jobID);

    if (!jobID) {
        console.log(req.body);
        res.status(400).json({
            errorMsg: 'No Job ID',
        })
        return;
    }

    let resp = await Jobs.findById(jobID)
    let createdJob = {
        title: resp.title,
        description: resp.description,
        qualification: resp.qualification,
        skills: resp.skills,
        company: resp.client,
        salary: resp.salRange,
        designation: resp.designation,
        exprange: resp.expRange,
        domain: resp.domain,
        client: resp.company,
        jobType: resp.jobType,
        contactName: resp.contact.name,
        contactNo: resp.contact.no,
        contactEmail: resp.contact.email,
        location: resp.location.combined,
        country: resp.location.country,
        applyUrl: resp.applyUrl
    };
    res.status(200).json(createdJob);
}

exports.employerUpdateJob = (req, res, next) => {

    let jobID = mongoose.Types.ObjectId(req.body.jobID);

    if (!jobID) {
        console.log(req.body);
        res.status(400).json({
            errorMsg: 'No Job Id',
        })
        return;
    }

    let createdJob = {
        title: req.body.title,
        userID: req.body.userID,
        date: {
            redited: Date.now(),
        },
        contact: {
            name: req.body.contactName,
            no: req.body.contactNo,
            email: req.body.contactEmail,
        },
        info: {
            skills: req.body.skills,
            expRange: req.body.exprange,
            salRange: req.body.salary,
            domain: req.body.domain,
            designation: req.body.designation,
            jobType: req.body.jobType,
            client: req.body.client,
            company: req.body.company,
            status: 'Submitted'
        },
        apply: {
            url: req.body.applyUrl,
        },
        description: req.body.description,
        qualification: req.body.qualification,
        location: {
            combined: req.body.location,
            country: req.body.country
        }
    }

    const result = createJobsValidation(createdJob);

    if (result.fails()) {
        console.log(result.errors.all());
        res.status(400).json({
            errorMsg: 'Validation Failed',
        })
        return;
    }

    Jobs.updateOne({
            _id: jobID
        }, {
            $set: createdJob
        })
        .then(resp => {
            if (resp.nModified == 1) {
                res.status(200).json({
                    message: 'Job Updated',
                })
            }
            // console.log(resp);
        })
        .catch(err => {
            console.log(err);
            res.status(400).json({
                message: 'Error encountered',
                error: err
            })
        })

}

// exports.getApplicantsforJob = async (req, res, next) => {

//     let jobID = mongoose.Types.ObjectId(req.body.jobID);

//     let fetchedApplicants = await Jobs.findById(jobID).select('applicants')

//     if (!fetchedApplicants) {
//         console.log(fetchedApplicants);
//         res.status(400).json({
//             errorMsg: 'Not able to fetch applicants',
//         })
//         return;
//     }
//     res.status(200).json(fetchedApplicants.applicants);

// };

// With Lookup 

exports.getApplicantsforJob = async (req, res, next) => {

    let jobID = mongoose.Types.ObjectId(req.body.jobID);

    let fetchedApplicants = await Jobs.aggregate([{
        $lookup: {
            from: "candidates",
            localField: "applicants",
            foreignField: "_id",
            as: "applicants"
        }
    }])

    if (!fetchedApplicants) {
        console.log(fetchedApplicants);
        res.status(400).json({
            errorMsg: 'Not able to fetch applicants',
        })
        return;
    }

    res.status(200).json(fetchedApplicants.applicants);

};