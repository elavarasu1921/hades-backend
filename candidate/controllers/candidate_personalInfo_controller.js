const mongoose = require('mongoose');
const Candidate = require('../models/candidate_model');
const {
    personalInfoValidation,
    contactInfoValidation,
} = require('../validation/candidate_personal_validation');
const CndtError = require('../middlewares/candidate_error_class');

exports.getPersonalInfo = async (req, res, next) => {
    if (!req.body.userID) {
        console.log(req.body);
        next(CndtError.badRequest('Not enough data'));
        return;
    }
    // console.log('req.body', req.body);
    const userID = mongoose.Types.ObjectId(req.body.userID);
    // try {
    const resp = await Candidate.findById(userID)
        .select(`
                personalInfo.name.firstName 
                personalInfo.name.lastName 
                personalInfo.gender
                personalInfo.maritalStatus
                personalInfo.experience
                personalInfo.contact.skypeID
                personalInfo.contact.no
                personalInfo.location.combined 
                personalInfo.location.country
                personalInfo.socialMedia.linkedIn
                personalInfo.phyDisabled
                resume.originalName`);

    const personalInfoResp = {
        firstName: resp.personalInfo.name.firstName,
        lastName: resp.personalInfo.name.lastName,
        gender: resp.personalInfo.gender,
        maritalStatus: resp.personalInfo.maritalStatus,
        experience: resp.personalInfo.experience,
        phyDisabled: resp.personalInfo.phyDisabled,
    };

    const contactInfoResp = {
        skypeID: resp.personalInfo.contact.skypeID,
        contactNo: resp.personalInfo.contact.no,
        location: resp.personalInfo.location.combined,
        country: resp.personalInfo.location.country,
        linkedIn: resp.personalInfo.socialMedia.linkedIn,
    };

    const resumeName = {
        name: resp.resume.originalName,
    };

    res.status(200).json({
        personalInfoResp,
        contactInfoResp,
        resumeName,
    });

    // } catch (err) {
    //     console.log(err);
    //     res.status(400).json({
    //         errMessage: "Not able to retrieve data",
    //     });
    // }
    // console.log(req.body);
};

exports.updatePersonalInfo = async (req, res, next) => {
    const createdUser = {
        'personalInfo.name.firstName': req.body.firstName,
        'personalInfo.name.lastName': req.body.lastName,
        'personalInfo.name.fullName': `${req.body.firstName} ${req.body.lastName}`,
        'personalInfo.gender': req.body.gender,
        'personalInfo.maritalStatus': req.body.maritalStatus,
        'personalInfo.phyDisabled': req.body.phyDisabled,
        'personalInfo.experience': req.body.experience,
    };

    const userID = mongoose.Types.ObjectId(req.body.userID);

    const result = personalInfoValidation(createdUser);

    if (result.fails()) {
        console.log(result.errors.all());
        next(CndtError.badRequest('Validation Failed'));
        return;
    }

    const resp = await Candidate.updateOne({
        _id: userID,
    }, {
        $set: createdUser,
    });

    if (!resp.n) {
        console.log(resp);
        next(CndtError.badRequest('Issue while updating...'));
    } else {
        res.status(200).json({
            successMsg: 'Successfully updated...',
        });
    }
};

exports.updateContactInfo = async (req, res, next) => {
    const createdData = {
        'personalInfo.contact.no': req.body.contactNo,
        'personalInfo.contact.skypeID': req.body.skypeID,
        'personalInfo.location.combined': req.body.location,
        'personalInfo.location.country': req.body.country,
        'personalInfo.socialMedia.linkedIn': req.body.linkedIn,
    };

    const result = contactInfoValidation(createdData);

    if (result.fails()) {
        console.log(result.errors.all());
        next(CndtError.badRequest('Validation Failed...'));
        return;
    }

    const resp = await Candidate.updateOne({
        _id: mongoose.Types.ObjectId(req.body.userID),
    }, {
        $set: createdData,
    });
    if (resp.n) {
        res.status(200).json({
            msg: 'Successfully updated data...',
        });
    } else {
        console.log(resp);
        next(CndtError.badRequest('Not able to update...'));
    }
};