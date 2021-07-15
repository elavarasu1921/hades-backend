const mongoose = require('mongoose');
const Jobs = require('../models/employer_jobs_model');
const {
    createJobsValidation,
    getMyJobsValidation,
} = require('../validation/employer_jobs_validation');
const Lookup = require('../models/employer_lookup_model');
const EmpError = require('../utils/employer_error_class');

// const THIRTY_DAYS_IN_MILLISECONDS = 2592000000;

exports.employerJobsCreate = async (req, res, next) => {
    const createdJob = {
        title: req.body.title,
        userID: req.body.userID,
        contact: {
            name: req.body.contactName,
            no: req.body.contactNo,
            email: req.body.contactEmail,
        },
        info: {
            skills: req.body.skills,
            expRange: req.body.exprange,
            domain: req.body.domain,
            salRange: req.body.salary,
            designation: req.body.designation,
            jobType: req.body.jobType,
            client: req.body.client,
            company: req.body.company,
        },
        apply: {
            url: req.body.applyUrl,
        },
        description: req.body.description,
        qualification: req.body.qualification,
        location: {
            combined: req.body.location,
            country: req.body.country,
        },
    };

    const result = createJobsValidation(createdJob);

    if (result.fails()) {
        console.log(result.errors.all());
        next(EmpError.badRequest('Validation Error...'));
        return;
    }

    const job = new Jobs(createdJob);

    const resp = await job.save();

    if (resp.nModified === 0) {
        console.log(resp);
        next(EmpError.badRequest('Not able to save job...'));
        return;
    }
    res.status(200).json({
        successMsg: 'Job Successfully Saved...',
        data: resp,
    });
};

exports.employerMyJobsList = async (req, res, next) => {
    const reqData = {
        userID: mongoose.Types.ObjectId(req.body.userID),
        currentPage: +req.query.currentPage,
        itemsPerPage: +req.query.itemsPerPage,
    };
    const result = getMyJobsValidation(reqData);
    if (result.fails()) {
        console.log('Data Missing');
        next(EmpError.badRequest('Data Missing...'));
        return;
    }
    const {
        userID,
        currentPage,
        itemsPerPage,
    } = reqData;
    const totalJobs = await Jobs.find({
            userID,
        })
        .countDocuments();

    const fetchedJobs = await Jobs.find({
            userID,
        })
        .select('title dates.posted dates.expiry info.status metrics.applications')
        .skip((currentPage - 1) * itemsPerPage)
        .limit(itemsPerPage);

    if (fetchedJobs.length === 0) {
        res.status(200).json({
            successMsg: 'No Posts found...',
        });
        return;
    }
    const createdJobs = fetchedJobs.map((ele) => {
        const tempJob = {};
        tempJob.title = ele.title;
        tempJob._id = ele._id;
        tempJob.status = ele.info.status;
        tempJob.postedDate = ele.dates.posted;
        tempJob.expiryDate = ele.dates.expiry;
        tempJob.applications = ele.metrics.applications;
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
    });
};

exports.employerGetMyJobsTitles = async (req, res) => {
    const fetchedTitles = await Jobs.find({
        userID: req.body.userID,
        'info.status': {
            $in: ['Expired', 'Live'],
        },
    }, 'title');

    res.status(200).json(fetchedTitles);
};

exports.employerAllJobsList = (req, res, next) => {
    // Need to add filter by user ID
    Jobs.find()
        .then((resp) => {
            res.status(200).json({
                successMsg: 'Posts Successfully Retrieved...',
                data: resp,
            });
        })
        .catch((err) => {
            console.log(err);
            next(EmpError.badRequest('No jobs found...'));
        });
};

exports.employerJobDelete = async (req, res, next) => {
    const reqData = {
        userID: req.body.userID,
        jobID: mongoose.Types.ObjectId(req.query.jobID),
    };
    const {
        userID,
        jobID,
    } = reqData;
    if (!(userID && jobID)) {
        next(EmpError.badRequest('No jobs found...'));
        return;
    }
    const resp = await Jobs.deleteOne({
        userID,
        _id: jobID,
    });
    if (resp.nModified === 1) {
        res.status(200).json({
            successMsg: 'Job Deleted',
        });
        return;
    }
    next(EmpError.badRequest('No job found...'));
};

exports.employerPostJobsLookup = async (req, res) => {
    const fetchedLookups = await Lookup.find({
            name: {
                $in: ['location', 'designation', 'exprange', 'skill'],
            },
        })
        .select('name value bdvalue -_id');

    function groupBy(arr, property) {
        return arr.reduce((memo, x) => {
            if (!memo[x[property]]) {
                memo[x[property]] = [];
            }
            memo[x[property]].push(x);
            return memo;
        }, {});
    }

    const brokenArrays = groupBy(fetchedLookups, 'name');
    res.status(200).json(brokenArrays);
};

exports.employerGetOneJob = async (req, res, next) => {
    const jobID = mongoose.Types.ObjectId(req.body.jobID);

    if (!jobID) {
        console.log(req.body);
        next(EmpError.badRequest('No job ID...'));
        return;
    }

    const resp = await Jobs.findById(jobID);
    const createdJob = {
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
        applyUrl: resp.applyUrl,
    };
    res.status(200).json(createdJob);
};

exports.employerUpdateJob = (req, res, next) => {
    const jobID = mongoose.Types.ObjectId(req.body.jobID);

    if (!jobID) {
        console.log(req.body);
        next(EmpError.badRequest('No job ID...'));
        return;
    }

    const createdJob = {
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
        },
    };

    const result = createJobsValidation(createdJob);

    if (result.fails()) {
        console.log(result.errors.all());
        next(EmpError.badRequest('Validation failed...'));
        return;
    }

    Jobs.updateOne({
            _id: jobID,
        }, {
            $set: createdJob,
        })
        .then((resp) => {
            if (resp.nModified === 1) {
                res.status(200).json({
                    message: 'Job Updated',
                });
            }
        })
        .catch((err) => {
            console.log(err);
            next(EmpError.badRequest('Error Encountered...'));
        });
};

exports.getApplicantsforJob = async (req, res, next) => {
    const jobID = mongoose.Types.ObjectId(req.body.jobID);

    try {
        const fetchedJobDetails = await Jobs.findById(jobID)
            .select('title applicants.appliedOn applicants.status')
            .populate('applicants.userID', 'name personalInfo.name.fullName personalInfo.location.city professionalInfo.current.designation');

        if (!fetchedJobDetails) {
            console.log(fetchedJobDetails);
            next(EmpError.badRequest('Error encountered'));
            return;
        }

        const applicantsList = fetchedJobDetails.applicants.map((ele) => {
            const applicant = {};
            applicant.name = ele.userID.personalInfo.name.fullName;
            applicant.location = ele.userID.personalInfo.location.city;
            applicant.designation = ele.userID.professionalInfo.current.designation;
            applicant.appliedOn = ele.appliedOn;
            applicant.status = ele.status;
            return applicant;
        });

        const createdJobDetails = {
            title: fetchedJobDetails.title,
            applicantsList,
        };

        res.status(200).json(createdJobDetails);
    } catch (error) {
        console.log(error);
        next(EmpError.badRequest('Error encountered...'));
    }
};