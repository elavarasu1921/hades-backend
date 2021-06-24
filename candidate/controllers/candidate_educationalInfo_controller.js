const Candidate = require('../models/candidate_model');
const mongoose = require('mongoose');

const {
    ugInfoValidation,
    pgInfoValidation,
    certificationInfoValidation
} = require('../validation/candidate_educational_validation');

exports.getEducationalData = (req, res, next) => {
    let userID = mongoose.Types.ObjectId(req.body.userID);
    Candidate.findById(userID)
        .select('educationalInfo')
        .then(resp => {
            if (!resp) {
                console.log(resp);
                res.status(400).json({
                    errMessage: 'No data found'
                })
            }
            let createdInfo = {
                ugDegree: {
                    degree: resp.educationalInfo.ugDegree.degree,
                    university: resp.educationalInfo.ugDegree.university,
                    specialization: resp.educationalInfo.ugDegree.specialization,
                    college: resp.educationalInfo.ugDegree.college,
                    type: resp.educationalInfo.ugDegree.educationType,
                    yog: resp.educationalInfo.ugDegree.YOG
                },
                pgDegree: {
                    degree: resp.educationalInfo.pgDegree.degree,
                    university: resp.educationalInfo.pgDegree.university,
                    specialization: resp.educationalInfo.pgDegree.specialization,
                    college: resp.educationalInfo.pgDegree.college,
                    type: resp.educationalInfo.pgDegree.educationType,
                    yog: resp.educationalInfo.pgDegree.YOG
                },
                certificationOne: {
                    certName01: resp.educationalInfo.certification.one.name,
                    institute01: resp.educationalInfo.certification.one.institute,
                    year01: resp.educationalInfo.certification.one.year,
                    certName02: resp.educationalInfo.certification.two.name,
                    institute02: resp.educationalInfo.certification.two.institute,
                    year02: resp.educationalInfo.certification.two.year,
                },
            }

            res.status(200).json(createdInfo);

        })
        .catch(err => {
            console.log(err);
            res.status(400).json({
                errMessage: 'Error while fetching data'
            })
        })
}

exports.cndtUpdateUgInfo = async (req, res, next) => {

    let createdInfo = {
        degree: req.body.degree,
        university: req.body.university,
        college: req.body.college,
        educationType: req.body.type,
        specialization: req.body.specialization,
        YOG: req.body.yog
    }

    const result = ugInfoValidation(createdInfo);

    if (result.fails()) {
        console.log(result.errors.all());
        res.status(400).json({
            errorMsg: 'Validation Failed',
        })
        return;
    }

    let userID = mongoose.Types.ObjectId(req.body.userID);

    try {
        let resp = await Candidate.updateOne({
            _id: userID
        }, {
            $set: {
                'educationalInfo.ugDegree': createdInfo
            }
        });

        if (resp.nModified = 0) {
            console.log(resp);
            res.status(400).json({
                errMessage: 'Data update not done'
            })
            return;
        }

        res.status(200).json({
            successMsg: 'Data updated'
        })
    } catch (err) {
        console.log(err);
        res.status(400).json({
            errMessage: 'Not able to update education info...'
        });
    }

}

exports.cndtUpdatePgInfo = async (req, res, next) => {

    let createdInfo = {
        "educationalInfo.pgDegree.degree": req.body.degree,
        "educationalInfo.pgDegree.university": req.body.university,
        "educationalInfo.pgDegree.college": req.body.college,
        "educationalInfo.pgDegree.educationType": req.body.type,
        "educationalInfo.pgDegree.specialization": req.body.specialization,
        "educationalInfo.pgDegree.YOG": req.body.yog
    }

    const result = pgInfoValidation(createdInfo);

    if (result.fails()) {
        console.log(result.errors.all());
        res.status(400).json({
            errorMsg: 'Validation Failed',
        })
        return;
    }

    let userID = mongoose.Types.ObjectId(req.body.userID);

    let resp = await Candidate.updateOne({
        _id: userID
    }, {
        $set: createdInfo
    });

    if (resp.nModified = 0) {
        console.log(resp);
        res.status(400).json({
            errMessage: 'Data update not done'
        })
    }

    res.status(200).json({
        successMsg: 'Data updated'
    })

}

exports.cndtUpdateCertification = async (req, res, next) => {
    let createdInfo = {
        one: {
            name: req.body.certName01,
            institute: req.body.institute01,
            year: req.body.year01,
        },
        two: {
            name: req.body.certName02,
            institute: req.body.institute02,
            year: req.body.year02
        }
    }
    const result = certificationInfoValidation(createdInfo);

    if (result.fails()) {
        console.log(result.errors.all());
        res.status(400).json({
            errorMsg: 'Validation Failed',
        })
        return;
    }

    try {
        let userID = mongoose.Types.ObjectId(req.body.userID);
        let resp = await Candidate.updateOne({
            _id: userID
        }, {
            $set: {
                "educationalInfo.certification": createdInfo
            }
        })
        if (resp.nModified = 0) {
            console.log(resp);
            res.status(400).json({
                errMessage: 'Data update not done'
            })
        }
        res.status(200).json({
            successMsg: 'Data updated'
        })
    } catch (err) {
        console.log(err);
        res.status(400).json({
            errorMsg: 'Not able to update',
        })
    }
}