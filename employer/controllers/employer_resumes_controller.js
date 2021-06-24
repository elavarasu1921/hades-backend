const mongoose = require('mongoose');
const Candidates = require('../../candidate/models/candidate_model');
const Employers = require('../models/employer_model');
const path = require('path');
const mammoth = require('mammoth');
const Lookup = require('../models/employer_lookup_model');

exports.employerSearchResumes = async (req, res, next) => {
    let empID = mongoose.Types.ObjectId(req.body.userID);

    let empAccInfo = await Employers.findById(empID)
        .select('account.resumes');

    let dailyViewsLimit = empAccInfo.account.resumes.dailyLimit
    let viewsTillnowToday = empAccInfo.account.resumes.todayTotal

    let viewsRemaining = dailyViewsLimit - viewsTillnowToday;

    let searchResults = await Candidates.find()
        .select(`
                account.date.lastUpdated
                personalInfo.name.fullName
                personalInfo.location.combined
                personalInfo.experience
                personalInfo.relocation
                educationalInfo.ugDegree.specialization
                educationalInfo.ugDegree.degree
                educationalInfo.pgDegree.specialization
                educationalInfo.pgDegree.degree
                professionalInfo.current
                professionalInfo.domain
                professionalInfo.noticePeriod
                professionalInfo.skills
                `)

    let getSkills = (arr) => {
        arr.map(oneSkill => {
            return oneSkill.name;
        })
    }

    if (!searchResults) {
        console.log(searchResults);
        res.status(400).json({
            errorMsg: 'Not able to fetch results',
        })
        return;
    }

    let results = searchResults.map(ele => {
        const eachResume = {};
        eachResume.cndtID = ele._id;
        eachResume.lastUpdated = ele.account.date.lastUpdated;
        eachResume.fullName = ele.personalInfo.name.fullName;
        eachResume.location = ele.personalInfo.location.combined;
        eachResume.experience = ele.personalInfo.experience;
        eachResume.relocation = ele.personalInfo.relocation;
        eachResume.designation = ele.professionalInfo.current.designation;
        eachResume.company = ele.professionalInfo.current.company;
        eachResume.salary = ele.professionalInfo.current.salary;
        eachResume.domain = ele.professionalInfo.domain;
        eachResume.noticePeriod = ele.professionalInfo.noticePeriod;
        eachResume.ugSpecialization = ele.educationalInfo.ugDegree.specialization;
        eachResume.ugDegree = ele.educationalInfo.ugDegree.degree;
        eachResume.pgSpecialization = ele.educationalInfo.pgDegree.specialization;
        eachResume.pgDegree = ele.educationalInfo.pgDegree.degree;
        eachResume.skills = getSkills(ele.professionalInfo.skills);
        return eachResume;
    })

    res.status(200).json({
        results,
        viewsRemaining
    })

}

exports.employerOneResumeView = async (req, res, next) => {
    if (!req.body.cndtID) {
        res.status(400).json({
            errMessage: 'Invalid Request'
        });
        return
    }
    let cndtID = mongoose.Types.ObjectId(req.body.cndtID);
    let empID = mongoose.Types.ObjectId(req.body.userID);

    let empAccInfo = await Employers.findByIdAndUpdate(empID, {
        $inc: {
            "account.resumes.todayTotal": 1
        }
    }, {
        new: true
    }).select('account.resumes');

    let dailyViewsLimit = empAccInfo.account.resumes.dailyLimit
    let viewsTillnowToday = empAccInfo.account.resumes.todayTotal

    if (viewsTillnowToday > dailyViewsLimit) {
        res.status(400).json({
            errorMsg: 'No views left',
        })
        return;
    }

    let fetchedCandidate = await Candidates.findById(cndtID)
        .select(`
        userName
        resume
        account.date.lastUpdated
        personalInfo.name.fullName
        personalInfo.contact.no
        personalInfo.profileImgUrl
        personalInfo.location.combined
        personalInfo.location.country
        personalInfo.relocation
        personalInfo.socialMedia.linkedIn
        personalInfo.experience
        personalInfo.educationalInfo
        personalInfo.professionalInfo
        `)
    if (!fetchedCandidate) {
        console.log(fetchedCandidate);
        res.status(400).json({
            errMessage: "No Profile found..."
        })
        return;
    }
    let createdProfile = {
        name: fetchedCandidate.personalInfo.name.fullName,
        emailID: fetchedCandidate.userName,
        resumeName: fetchedCandidate.resume.originalName,
        profileImgUrl: fetchedCandidate.personalInfo.profileImgUrl,
        contactNo: fetchedCandidate.personalInfo.contact.no,
        skypeID: fetchedCandidate.personalInfo.contact.skypeID,
        location: fetchedCandidate.personalInfo.location.combined,
        country: fetchedCandidate.personalInfo.location.country,
        relocation: fetchedCandidate.personalInfo.relocation,
        linkedIn: fetchedCandidate.personalInfo.socialMedia.linkedIn,
        experience: fetchedCandidate.personalInfo.experience,
        ugDegree: fetchedCandidate.educationalInfo.ugDegree.degree,
        ugUniversity: fetchedCandidate.educationalInfo.ugDegree.university,
        ugCollege: fetchedCandidate.educationalInfo.ugDegree.college,
        ugEducationType: fetchedCandidate.educationalInfo.ugDegree.educationType,
        ugSpecialization: fetchedCandidate.educationalInfo.ugDegree.specialization,
        ugYOG: fetchedCandidate.educationalInfo.pgDegree.YOG,
        pgDegree: fetchedCandidate.educationalInfo.pgDegree.degree,
        pgUniversity: fetchedCandidate.educationalInfo.pgDegree.university,
        pgCollege: fetchedCandidate.educationalInfo.pgDegree.college,
        pgEducationType: fetchedCandidate.educationalInfo.pgDegree.educationType,
        pgSpecialization: fetchedCandidate.educationalInfo.pgDegree.specialization,
        pgYOG: fetchedCandidate.educationalInfo.pgDegree.YOG,
        certificationOneName: fetchedCandidate.educationalInfo.certification.one.name,
        certificationOneYear: fetchedCandidate.educationalInfo.certification.one.year,
        certificationTwoName: fetchedCandidate.educationalInfo.certification.two.name,
        certificationTwoYear: fetchedCandidate.educationalInfo.certification.two.year,
        noticePeriod: fetchedCandidate.professionalInfo.noticePeriod,
        domain: fetchedCandidate.professionalInfo.domain,
        profileTitle: fetchedCandidate.professionalInfo.profileTitle,
        designation: fetchedCandidate.professionalInfo.current.designation,
        company: fetchedCandidate.professionalInfo.current.company,
        salary: fetchedCandidate.professionalInfo.current.salary,
        expectedDesignation: fetchedCandidate.professionalInfo.expected.designation,
        preferredCities: fetchedCandidate.professionalInfo.expected.cities,
    }
    res.status(200).json({
        profileData: createdProfile,
        viewsRemaining: dailyViewsLimit - viewsTillnowToday
    });
}

exports.empDownloadCndtResume = async (req, res, next) => {
    if (!req.body.cndtID) return;
    let cndtID = mongoose.Types.ObjectId(req.body.cndtID);

    let resumeUrl = await Candidates.findById(cndtID, 'resume.originalUrl')
    if (!resumeUrl) {
        console.log(resumeUrl);
        res.status(400).json({
            errMessage: "Error finding profile"
        })
        return;
    }
    let filePath = path.join(__dirname, '../../') + resumeUrl.resume.originalUrl;
    res.sendFile(filePath);
}

exports.getCndtResumeData = async (req, res, next) => {

    let docx = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    let doc = 'application/msword';

    let userID = mongoose.Types.ObjectId(req.body.cndtID);
    let resp = await Candidates.findById(userID)
        .select('resume')
    let fileType = resp.resume.mimeType;

    if (fileType === docx || fileType === doc) {
        let resumeText = await mammoth.convertToHtml({
            path: resp.resume.convertedUrl
        })
        res.status(200).json(resumeText.value);
    } else {
        res.status(400).json({
            errMessage: "Unsupported resume format"
        })
    }

};

exports.getLookupForSearch = async (req, res, next) => {

    let fetchedLookups = await Lookup.find({
            name: {
                $in: ["location", 'exprange']
            }
        })
        .select('name value bdvalue -_id')

    if (!fetchedLookups) {
        console.log(fetchedLookups);
        res.status(400).json({
            errorMsg: 'Not able to retrieve data',
        })
        return;
    }

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

};