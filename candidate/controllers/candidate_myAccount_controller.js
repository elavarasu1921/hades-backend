const Candidate = require("../models/candidate_model");
const mongoose = require('mongoose');
const path = require('path');
const mammoth = require('mammoth');

exports.getMyAccountInfo = async (req, res, next) => {

    if (!req.body.userID) {
        console.log(req.body);
        res.status(400).json({
            errorMsg: 'Not enough data',
        })
        return;
    }

    let userID = mongoose.Types.ObjectId(req.body.userID);
    let docx = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    let doc = 'application/msword';

    let fetchedCandidate = await Candidate.findById(userID)
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
        `)

    if (!fetchedCandidate) {
        console.log(fetchedCandidate);
        res.status(400).json({
            errMessage: "Couldn't find profile info..."
        })
        return;
    }

    let createdCandidate = {
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
    }

    res.status(200).json(createdCandidate);

}

exports.cndtResumeDownload = (req, res, next) => {
    if (!req.body.userID) return;
    let userID = mongoose.Types.ObjectId(req.body.userID);
    Candidate.findById(userID)
        .select('resume.originalUrl')
        .then(resp => {
            if (!resp) {
                console.log(resp);
                res.status(400).json({
                    msg: "Couldn't find resume to download"
                });
                return;
            } else {
                let filePath = path.join(__dirname, '../../') + resp.resume.originalUrl;
                res.sendFile(filePath);
            }
        })
}

exports.getResumeData = async (req, res, next) => {
    // console.log('working1');

    let docx = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    let doc = 'application/msword';

    let userID = mongoose.Types.ObjectId(req.body.userID);
    let resp = await Candidate.findById(userID)
        .select('resume')
    let fileType = resp.resume.mimeType;

    if (fileType === docx || fileType === doc) {
        // console.log('working2');
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