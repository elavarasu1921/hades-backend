const mongoose = require('mongoose');
const Jobs = require('../../employer/models/employer_jobs_model');

const THIRTYDAYS_IN_MILLISECONDS = 2592000000;

exports.getAllSubmittedJobs = (req, res) => {
    const status = req.body.status || ['Submitted', 'Live', 'Rejected', 'Expired', 'Deleted'];
    Jobs.find({
            'info.status': status,
        })
        .select(`
            title
            dates.posted
            info.company
            info.status
            info.jobType
            `)
        .then((resp) => {
            if (!resp) {
                console.log(resp);
                res.status(400).json({
                    errorMsg: 'No Jobs Found',
                });
                return;
            }
            const createdJobs = resp.map((ele) => {
                const eachJob = {};
                eachJob.id = ele._id;
                eachJob.title = ele.title;
                eachJob.postedOn = ele.dates.posted;
                eachJob.status = ele.info.status;
                eachJob.type = ele.info.jobType;
                eachJob.company = ele.info.company;
                return eachJob;
            });
            res.status(200).json(createdJobs);
        })
        .catch((err) => {
            console.log(err);
            res.status(400).json({
                msg: 'Api hit',
            });
        });
};

exports.getOneJobInfo = (req, res) => {
    const jobID = mongoose.Types.ObjectId(req.body.jobID);
    if (!jobID) {
        console.log(req.body);
        res.status(400).json({
            errorMsg: 'Job ID Invalid',
        });
        return;
    }
    Jobs.findById(jobID)
        .select(`
            title
            dates.posted
            info.status
            location.combined
            metrics`)
        .then((resp) => {
            if (!resp) {
                console.log(resp);
                res.status(400).json({
                    errorMsg: 'Not able to find requested data',
                });
                return;
            }
            const createdJob = {
                status: resp.info.status,
                location: resp.location.combined,
                title: resp.title,
                company: resp.company,
                applications: resp.metrics.applications,
                views: resp.metrics.views,
            };
            res.status(200).json(createdJob);
        })
        .catch((err) => {
            console.log(err);
            res.status(400).json({
                errorMsg: 'Not able to perform action',
            });
        });
};

exports.onApproveJob = (req, res) => {
    const jobID = mongoose.Types.ObjectId(req.body.jobID);
    if (!jobID) {
        console.log(req.body);
        res.status(400).json({
            errorMsg: 'Job ID Invalid',
        });
        return;
    }
    Jobs.updateOne({
            _id: jobID,
        }, {
            $set: {
                'info.status': 'Live',
                'dates.start': Date.now(),
                'dates.expiry': Date.now() + THIRTYDAYS_IN_MILLISECONDS,
            },
        })
        .then((resp) => {
            if (!resp) {
                console.log(resp);
                res.status(400).json({
                    errorMsg: 'Not able to find requested Job',
                });
                return;
            }
            if (resp.nModified > 0) {
                res.status(200).json(resp);
            }
        })
        .catch((err) => {
            console.log(err);
            res.status(400).json({
                errorMsg: 'Not able to find Job',
            });
        });
};

exports.onRejectJob = (req, res) => {
    const jobID = mongoose.Types.ObjectId(req.body.jobID);
    Jobs.updateOne({
            _id: jobID,
        }, {
            $set: {
                'info.status': 'Rejected',
                'dates.start': '',
                'dates.expiry': '',
            },
        })
        .then((resp) => {
            if (!resp) {
                res.status(400).json({
                    errorMsg: 'Not able to find requested job',
                });
                return;
            }
            if (resp.nModified < 0) {
                console.log(resp);
                res.status(400).json({
                    errorMsg: 'Not able to update job',
                });
                return;
            }
            res.status(200).json({
                successMsg: 'Job Updated',
            });
        })
        .catch((err) => {
            console.log(err);
            res.status(400).json({
                errorMsg: 'Not able to update job',
            });
        });
};

exports.onExpireJob = (req, res) => {
    const jobID = mongoose.Types.ObjectId(req.body.jobID);
    Jobs.updateOne({
            _id: jobID,
        }, {
            $set: {
                'info.status': 'Expired',
                'dates.expiry': Date.now(),
            },
        })
        .then((resp) => {
            if (!resp) {
                res.status(400).json({
                    errorMsg: 'Not able to find requested job',
                });
                return;
            }
            if (resp.nModified < 0) {
                console.log(resp);
                res.status(400).json({
                    errorMsg: 'Not able to update job',
                });
                return;
            }
            res.status(200).json({
                successMsg: 'Job Updated',
            });
        })
        .catch((err) => {
            console.log(err);
            res.status(400).json({
                errorMsg: 'Not able to update job',
            });
        });
};