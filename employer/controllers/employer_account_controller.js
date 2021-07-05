const mongoose = require('mongoose');
const Employer = require('../models/employer_model');
const accValidation = require('../validation/employer_account_validation');

exports.getEmployerInfo = (req, res) => {
    const userID = mongoose.Types.ObjectId(req.body.userID);

    Employer.findById(userID)
        .select(`
            company.name
            company.url
            company.linkedIn
            company.location.combined
            company.location.country
            company.location.address
            primaryContact.firstName
            primaryContact.secondName
            primaryContact.contactNo
            primaryContact.designation
            primaryContact.lastName
        `)
        .then((resp) => {
            const createdEmployer = {
                companyName: resp.company.name,
                companyUrl: resp.company.url,
                companyLinkedIn: resp.company.linkedIn,
                firstName: resp.primaryContact.firstName,
                lastName: resp.primaryContact.lastName,
                contactNo: resp.primaryContact.contactNo,
                designation: resp.primaryContact.designation,
                city: resp.company.location.combined,
                country: resp.company.location.country,
                address: resp.company.location.address,
            };
            res.status(200).json(createdEmployer);
        })
        .catch((err) => {
            console.log(err);
            res.status(400).json({
                errMessage: 'Not able to retrieve company info',
            });
        });
};

exports.employerInfoUpdate = async (req, res) => {
    // console.log('', req.body);

    const userID = mongoose.Types.ObjectId(req.body.userID);

    if (!req.body.userID) {
        console.log(req.body);
        res.status(400).json({
            errorMsg: 'Not enough data',
        });
        return;
    }

    const createdEmployer = {
        'primaryContact.firstName': req.body.firstName,
        'primaryContact.lastName': req.body.lastName,
        'primaryContact.fullName': `${req.body.firstName} ${req.body.lastName}`,
        'primaryContact.contactNo': req.body.contactNo,
        'primaryContact.designation': req.body.designation,
        'company.location.combined': req.body.city,
        'company.location.country': req.body.country,
        'company.location.address': req.body.address,
        'company.name': req.body.companyName,
        'company.url': req.body.companyUrl,
        'company.linkedIn': req.body.companyLinkedIn,
    };

    const result = accValidation.employerAccountValidation(createdEmployer);

    if (result.fails()) {
        console.log(result.errors.all());
        res.status(400).json({
            errorMsg: 'Validation Failed',
        });
        return;
    }

    const resp = await Employer.updateOne({
        _id: userID,
    }, {
        $set: createdEmployer,
    });

    if (!resp.n) {
        console.log(resp);
        res.status(400).json({
            errorMsg: 'Not able to find data',
        });
        return;
    }

    res.status(200).json({
        successMsg: 'Data Successfully Updated',
    });
};