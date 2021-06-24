const mongoose = require('mongoose');
const Jobs = require('../../employer/models/employer_jobs_model');

exports.getJobResults = async (req, res, next) => {

    let fetchedResults = await Jobs.find({
            $text: {
                $search: req.body.keywords
            }
        })
        .select(`
        title 
        info.company 
        dates.posted 
        info.designation 
        info.domain 
        info.expRange 
        info.jobType 
        location.combined 
        location.country 
        info.salRange 
        description 
        skills`)

    if (!fetchedResults) {
        console.log(fetchedResults);
        res.status(400).json({
            errorMsg: "Not able to retrieve Jobs",
        })
    }
    let createdJobs = fetchedResults.map(ele => {
        const tempJob = {};
        tempJob['_id'] = ele._id;
        tempJob['title'] = ele.title;
        tempJob['company'] = ele.company;
        tempJob['postedDate'] = ele.dates.posted;
        tempJob['designation'] = ele.info.designation;
        tempJob['domain'] = ele.info.domain;
        tempJob['expRange'] = ele.info.expRange;
        tempJob['jobType'] = ele.info.jobType;
        tempJob['location'] = ele.location.combined;
        tempJob['country'] = ele.location.country;
        tempJob['salRange'] = ele.info.salRange;
        tempJob['description'] = ele.description;
        tempJob['sills'] = ele.skills;
        return tempJob
    })

    res.status(200).json(createdJobs)

}

exports.getOneJob = async (req, res, next) => {

    if (!req.body.jobID) {
        console.log(req.body);
        res.status(400).json({
            errorMsg: 'Not enough data',
        })
        return;
    }

    const jobID = mongoose.Types.ObjectId(req.body.jobID);

    let fetchedJob = await Jobs.findById(jobID)
        .select(`
            title 
            dates.start 
            info
            location
            description
            qualification
            contact
            skills
            apply.url
            applicants`)

    if (!fetchedJob) {
        console.log(fetchedJob);
        res.status(400).json({
            errorMsg: 'No Job Found'
        });
        return;
    }

    let createdJob = {
        title: fetchedJob.title,
        postedDate: fetchedJob.dates.start,
        client: fetchedJob.info.client,
        company: fetchedJob.info.company,
        designation: fetchedJob.info.designation,
        domain: fetchedJob.info.domain,
        expRange: fetchedJob.info.expRange,
        jobType: fetchedJob.info.jobType,
        location: fetchedJob.location.combined,
        country: fetchedJob.location.country,
        qualification: fetchedJob.qualification,
        userID: fetchedJob.userID,
        salRange: fetchedJob.info.salRange,
        description: fetchedJob.description,
        skills: fetchedJob.skills,
        contactName: fetchedJob.contact.name,
        contactNo: fetchedJob.contact.no,
        contactEmail: fetchedJob.contact.email,
        applyURL: fetchedJob.apply.url,
    }

    let hasApplied = fetchedJob.applicants.some(ele => req.body.userID === ele.userID);
    createdJob.hasApplied = hasApplied;
    res.status(200).json(createdJob)

}

exports.onApplyToJob = async (req, res, next) => {

    if (!(req.body.jobID && req.body.userID)) {
        console.log(req.body);
        res.status(400).json({
            errorMsg: 'Not enough data',
        })
        return;
    }
    const _id = mongoose.Types.ObjectId(req.body.jobID);
    let resp = await Jobs.updateOne({
        _id
    }, {
        $addToSet: {
            applicants: {
                userID: req.body.userID,
                name: req.body.name,
                location: req.body.location,
                designation: req.body.designation,
                status: 'Applied',
                appliedOn: Date.now(),
            }
        }
    })
    if (resp.nModified == 0) {
        res.status(400).json({
            message: 'No Job Found',
            data: err,
        })
        return;
    }
    if (resp.n == 0) {
        console.log(resp);
        res.status(400).json({
            errorMsg: 'Not able to apply',
        })
        return;
    }
    res.status(200).json({
        message: 'Successfully Applied'
    })

}