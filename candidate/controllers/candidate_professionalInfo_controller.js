const mongoose = require('mongoose');
const Candidate = require('../models/candidate_model');
const {
    professionalInfoValidation,
} = require('../validation/candidate_professional_validation');
const CndtError = require('../middlewares/candidate_error_class');

exports.updateProfessionalInfo = async (req, res, next) => {
    const userID = mongoose.Types.ObjectId(req.body.userID);

    const createdData = {
        'professionalInfo.profileTitle': req.body.profileTitle,
        'professionalInfo.coverLetter': req.body.coverLetter,
        'professionalInfo.relocation': req.body.relocation,
        'professionalInfo.domain': req.body.domain,
        'professionalInfo.current.designation': req.body.currentDesignation,
        'professionalInfo.current.salary': req.body.currentSalary,
        'professionalInfo.current.company': req.body.currentCompany,
        'professionalInfo.expected.designation': req.body.desiredPosition,
        'professionalInfo.expected.salary': req.body.expectedSalary,
        'professionalInfo.expected.cities': req.body.preferredCities,
        'professionalInfo.skillsList': req.body.skills,
        'professionalInfo.noticePeriod': req.body.noticePeriod,
    };

    // console.log('', createdData);
    const result = professionalInfoValidation(createdData);

    if (result.fails()) {
        console.log(result.errors.all());
        next(CndtError.badRequest('Validation failed...'));
        return;
    }

    const resp = await Candidate.updateOne({
        _id: userID,
    }, {
        $set: createdData,
    });

    if (resp.nModified === 0) {
        console.log(resp);
        next(CndtError.badRequest('Not able to update data...'));
        return;
    }

    res.status(200).json({
        successMsg: 'Data updated',
    });
};

exports.getProfessionalInfo = async (req, res, next) => {
    const userID = mongoose.Types.ObjectId(req.body.userID);

    const resp = await Candidate.findById(userID).select('professionalInfo');

    if (!resp) {
        console.log(resp);
        next(CndtError.badRequest('Not able to find data...'));
        return;
    }

    const createdData = {
        profileTitle: resp.professionalInfo.profileTitle,
        coverLetter: resp.professionalInfo.coverLetter,
        currentDesignation: resp.professionalInfo.current.designation,
        currentSalary: resp.professionalInfo.current.salary,
        currentCompany: resp.professionalInfo.current.company,
        domain: resp.professionalInfo.domain,
        noticePeriod: resp.professionalInfo.noticePeriod,
        relocation: resp.professionalInfo.relocation,
        preferredCities: resp.professionalInfo.expected.cities,
        desiredPosition: resp.professionalInfo.expected.designation,
        skills: resp.professionalInfo.skillsList,
    };

    res.status(200).json(createdData);
};