const mongoose = require('mongoose');
const path = require('path');
const mammoth = require('mammoth');
const Candidates = require('../../candidate/models/candidate_model');
const Employers = require('../models/employer_model');
const {
    accessControl,
} = require('../middlewares/empoyer_access_control');

exports.employerSearchResumes = async (req, res) => {
    const empID = mongoose.Types.ObjectId(req.body.userID);

    const empAccInfo = await Employers.findById(empID)
        .select('account.resumes');

    if (!empAccInfo) {
        console.log(empAccInfo);
        res.status(400).json({
            errorMsg: 'Not able to fetch employer account',
        });
        return;
    }

    const dailyViewsLimit = empAccInfo.account.resumes.dailyLimit;
    const viewsTillnowToday = empAccInfo.account.resumes.todayTotal;

    const viewsRemaining = dailyViewsLimit - viewsTillnowToday;

    const searchResults = await Candidates.find()
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
                `);

    const getSkills = (arr) => {
        arr.map((oneSkill) => oneSkill.name);
    };

    if (!searchResults) {
        console.log(searchResults);
        res.status(400).json({
            errorMsg: 'Not able to fetch results',
        });
        return;
    }

    const results = searchResults.map((ele) => {
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
    });

    res.status(200).json({
        results,
        viewsRemaining,
    });
};

exports.employerOneResumeView = async (req, res) => {
    if (!req.body.cndtID) {
        res.status(400).json({
            errMessage: 'Invalid Request',
        });
        return;
    }

    const cndtID = mongoose.Types.ObjectId(req.body.cndtID);
    const empID = mongoose.Types.ObjectId(req.body.userID);

    const empAccInfo = await Employers.findByIdAndUpdate(empID, {
        $inc: {
            'account.resumes.todayTotal': 1,
        },
    }, {
        new: true,
    }).select('account.resumes');

    const dailyViewsLimit = empAccInfo.account.resumes.dailyLimit;
    const viewsTillnowToday = empAccInfo.account.resumes.todayTotal;

    if (viewsTillnowToday > dailyViewsLimit) {
        res.status(400).json({
            errorMsg: 'No views left',
        });
        return;
    }

    const fetchedCandidate = await Candidates.findById(cndtID)
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
        `);

    if (!fetchedCandidate) {
        console.log(fetchedCandidate);
        res.status(400).json({
            errMessage: 'No Profile found...',
        });
        return;
    }

    const createdProfile = {
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
    };

    const permission = accessControl.can('admin').readAny('Candidates');

    if (!permission.granted) {
        console.log(permission.granted);
        res.status(400).json({
            errorMsg: 'Not authorized',
        });
        return;
    }

    const filteredCandidate = permission.filter(createdProfile);

    res.status(200).json({
        profileData: filteredCandidate,
        viewsRemaining: dailyViewsLimit - viewsTillnowToday,
    });
};

exports.empDownloadCndtResume = async (req, res) => {
    if (!req.body.cndtID) return;
    const cndtID = mongoose.Types.ObjectId(req.body.cndtID);

    const resumeUrl = await Candidates.findById(cndtID, 'resume.originalUrl');
    if (!resumeUrl) {
        console.log(resumeUrl);
        res.status(400).json({
            errMessage: 'Error finding profile',
        });
        return;
    }
    const filePath = path.join(__dirname, '../../') + resumeUrl.resume.originalUrl;
    res.sendFile(filePath);
};

exports.getCndtResumeData = async (req, res) => {
    const docx = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    const doc = 'application/msword';

    const userID = mongoose.Types.ObjectId(req.body.cndtID);
    const resp = await Candidates.findById(userID)
        .select('resume');
    const fileType = resp.resume.mimeType;

    let resumeText;

    if (fileType === docx || fileType === doc) {
        resumeText = await mammoth.convertToHtml({
            path: resp.resume.convertedUrl,
        });

        if (!resumeText) {
            console.log(resumeText);
            res.status(400).json({
                errorMsg: 'Not able to retrieve resume data',
            });
        }
    } else {
        res.status(400).json({
            errMessage: 'Unsupported resume format',
        });
    }

    res.status(200).json(resumeText.value);
};