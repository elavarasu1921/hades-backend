const Employers = require('../../employer/models/employer_model');
const mongoose = require('mongoose');

exports.listAllEmployers = (req, res, next) => {
    Employers.find()
        .select(`
            company.name
            primaryContact.fullName
            company.location.combined
            account.status
            account.createdOn
            account.jobs.live
            `)
        .then(resp => {
            if (!resp) {
                console.log(resp);
                res.status(400).json({
                    errorMsg: 'No employers found'
                })
                return;
            }
            let createdEmployers = resp.map(ele => {
                let oneEmployer = {};
                oneEmployer.empID = ele._id;
                oneEmployer.name = ele.company.name;
                oneEmployer.contactName = ele.primaryContact.fullName;
                oneEmployer.createdOn = ele.account.createdOn;
                oneEmployer.location = ele.company.location.combined;
                oneEmployer.jobs = ele.account.jobs.live;
                oneEmployer.status = ele.account.status;

                return oneEmployer;
            })
            res.status(200).json(createdEmployers);
        })
        .catch(err => {
            console.log(err);
            res.status(400).json({
                errorMsg: 'Not able to retrieve employers'
            })
        })
};

exports.onGetOneEmployer = (req, res, next) => {
    let empID = mongoose.Types.ObjectId(req.body.empID);
    Employers.findById(empID)
        .select(`
            company.name
            company.url
            company.linkedIn
            company.location.combined
            account.status
            account.createdOn
            account.resumes
            account.jobs
            primaryContact.fullName
        `)
        .then(resp => {
            if (!resp) {
                console.log(resp);
                res.status(400).json({
                    errorMsg: 'Not able to find employer'
                })
                return;
            }
            let createdEmployer = {
                name: resp.company.name,
                empID: resp._id,
                url: resp.company.url,
                linkedIn: resp.company.linkedIn,
                location: resp.company.location.combined,
                status: resp.account.status,
                createdOn: resp.account.createdOn,
                dailyResumeLimit: resp.account.resumes.dailyLimit,
                todayTotalView: resp.account.resumes.todayTotal,
                jobsQuota: resp.account.jobs.quota,
                liveJobs: resp.account.jobs.live
            }
            res.status(200).json(createdEmployer);
        })
        .catch(err => {
            console.log(err);
            res.status(400).json({
                errorMsg: 'Not able to perform find on employer list'
            })
        })
};