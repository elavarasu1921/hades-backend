const mongoose = require('mongoose');
const path = require('path');
const mammoth = require('mammoth');
const Candidate = require('../models/candidate_model');
const CndtError = require('../middlewares/candidate_error_class');

exports.getMyAccountInfo = async (req, res, next) => {
    if (!req.body.userID) {
        console.log(req.body);
        next(CndtError.badRequest('Not enough data...'));
        return;
    }

    const userID = mongoose.Types.ObjectId(req.body.userID);

    const fetchedCandidate = await Candidate.findById(userID)
        .select(`
        personalInfo.name.fullName
        personalInfo.profileImgUrl
        userName
        resume
        personalInfo.contact.no
        personalInfo.experience
        personalInfo.location.combined
        personalInfo.socialMedia.linkedIn
        educationalInfo
        professionalInfo.current
        professionalInfo.noticePeriod
        `);

    if (!fetchedCandidate) {
        console.log(fetchedCandidate);
        next(CndtError.badRequest('Couldnt find profile info'));
        return;
    }

    const createdCandidate = {
        name: fetchedCandidate.personalInfo.name.fullName,
        profileImgUrl: fetchedCandidate.personalInfo.profileImgUrl,
        emailID: fetchedCandidate.userName,
        experience: fetchedCandidate.personalInfo.experience,
        contactNo: fetchedCandidate.personalInfo.contact.no,
        location: fetchedCandidate.personalInfo.location.combined,
        linkedIn: fetchedCandidate.personalInfo.socialMedia.linkedIn,
        resumeName: fetchedCandidate.resume.originalName,
        resumeUrl: fetchedCandidate.resume.url,
        ugDegree: fetchedCandidate.educationalInfo.ugDegree.degree,
        ugUniversity: fetchedCandidate.educationalInfo.ugDegree.university,
        ugCollege: fetchedCandidate.educationalInfo.ugDegree.college,
        ugSpecialization: fetchedCandidate.educationalInfo.ugDegree.specialization,
        pgDegree: fetchedCandidate.educationalInfo.pgDegree.degree,
        pgUniversity: fetchedCandidate.educationalInfo.pgDegree.university,
        pgCollege: fetchedCandidate.educationalInfo.pgDegree.college,
        pgSpecialization: fetchedCandidate.educationalInfo.pgDegree.specialization,
    };

    // RedisClient.setex('createdCandidate', RedisExp, JSON.stringify(createdCandidate));

    res.status(200).json(createdCandidate);
};

exports.cndtResumeDownload = (req, res, next) => {
    if (!req.body.userID) return;

    const userID = mongoose.Types.ObjectId(req.body.userID);

    Candidate.findById(userID)
        .select('resume.originalUrl')
        .then((resp) => {
            if (!resp) {
                console.log(resp);
                next(CndtError.badRequest('Couldnt find resume to download...'));
            } else {
                const filePath = path.join(__dirname, '../../') + resp.resume.originalUrl;
                res.sendFile(filePath);
            }
        });
};

exports.getResumeData = async (req, res, next) => {
    // console.log('working1');

    const docx = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    const doc = 'application/msword';

    const userID = mongoose.Types.ObjectId(req.body.userID);
    const resp = await Candidate.findById(userID)
        .select('resume');
    const fileType = resp.resume.mimeType;

    if (fileType === docx || fileType === doc) {
        // console.log('working2');
        const resumeText = await mammoth.convertToHtml({
            path: resp.resume.convertedUrl,
        });
        res.status(200).json(resumeText.value);
    } else {
        next(CndtError.badRequest('Unsupported resume format'));
    }
};