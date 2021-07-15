const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const {
    employerSignUpValidation,
    employerLoginValidation,
} = require('../validation/employer_auth_validation');
const Employer = require('../models/employer_model');
require('dotenv').config();
const {
    email,
} = require('../utils/mailing');
const EmpError = require('../utils/employer_error_class');

const JWT_EXPIRY_TIME = 36000;

exports.employerSignUp = async (req, res, next) => {
    const hash$ = await bcrypt.hash(req.body.password, 10);
    const city = req.body.city.slice(0, req.body.city.length - 4);
    const state = req.body.city.slice(-2);
    const createdEmployer = {
        userName: req.body.userName,
        password: hash$,
        primaryContact: {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            fullName: `${req.body.firstName} ${req.body.lastName}`,
            contactNo: req.body.contactNo,
            designation: req.body.designation,
        },
        company: {
            name: req.body.companyName,
            location: {
                city,
                state,
                country: req.body.country,
                combined: req.body.city,
            },
        },
        account: {
            emailValidationToken: crypto.randomBytes(64).toString('hex'),
            emailValidationTokenExpiry: Date.now() + JWT_EXPIRY_TIME,
        },
    };
    const result = employerSignUpValidation(createdEmployer);
    if (result.fails()) {
        console.log(result.errors.all());
        next(EmpError.badRequest('Validation failed...'));
        return;
    }
    const employer = new Employer(createdEmployer);
    const resp = await employer.save();

    if (!resp) {
        console.log(resp);
        next(EmpError.badRequest('Not able to register'));
        return;
    }

    if (resp) {
        email.send({
                template: 'after_register',
                message: {
                    to: 'elavarasu.kcg@gmail.com',
                },
                locals: {
                    activationLink: `http://localhost:4200/auth/activateAcc/${resp.account.emailValidationToken}`,
                },
            })
            .then(() => console.log('Activation Email Sent!!!'))
            .catch((err) => console.log('Mailer Issue:', err));
    }
};

exports.employerActivateAccount = (req, res, next) => {
    Employer.findOneAndUpdate({
            'account.emailValidationToken': req.body.activationID,
        }, {
            $set: {
                'account.status': 'Active',
            },
        })
        .then((resp) => {
            if (!resp) {
                console.log('no account', resp);
                next(EmpError.badRequest('Not able to find account...'));
                return;
            }
            res.status(200).json({
                msg: 'Account Activated',
            });
        })
        .catch((err) => {
            console.log('error', err);
            next(EmpError.badRequest('Find Operation not performed'));
        });
};

exports.employerResendActivationEmail = (req, res, next) => {
    if (!req.body.userName) {
        next(EmpError.badRequest('No Email found...'));
        return;
    }
    Employer.findOneAndUpdate({
            userName: req.body.userName,
        }, {
            $set: {
                'account.emailValidationTokenExpiry': Date.now() + JWT_EXPIRY_TIME,
            },
        })
        .select('userName account.emailValidationToken')
        .then((resp) => {
            if (!resp) {
                next(EmpError.badRequest('No user found...'));
                return;
            }

            email.send({
                    template: 'after_register',
                    message: {
                        to: 'elavarasu.kcg@gmail.com',
                    },
                    locals: {
                        activationLink: `http://localhost:4200/auth/activateAcc/${resp.account.emailValidationToken}`,
                    },
                })
                .then(() => console.log('Activation Email Sent!!!'))
                .catch((err) => console.log('Mailer Issue:', err));
        })
        .catch((err) => {
            console.log('Error', err);
            next(EmpError.badRequest('Issue occured while sending activation mail again...'));
        });
};

exports.employerLogin = async (req, res, next) => {
    const result = employerLoginValidation(req.body);

    if (result.fails()) {
        console.log(result.errors.all());
        next(EmpError.badRequest('Validation Error'));
        return;
    }

    const {
        userName,
        password,
    } = req.body;
    const fetchedEmployer = await Employer.findOne({
        userName,
    }).select(`
    password
    account.status
    primaryContact.fullName
    company.name`);

    if (!fetchedEmployer) {
        next(EmpError.badRequest('No user found...'));
        return;
    }

    if (fetchedEmployer.account.status !== 'Active') {
        console.log(fetchedEmployer);
        next(EmpError.badRequest('Emp error handler'));
        return;
    }

    const hash$ = await bcrypt.compare(password, fetchedEmployer.password);
    if (!hash$) {
        next(EmpError.badRequest('Please check your credentials...'));
        return;
    }

    const token = jwt.sign({
        userName,
        userID: new mongoose.Types.ObjectId(fetchedEmployer._id),
    }, process.env.JWT_SECRET_KEY, {
        expiresIn: JWT_EXPIRY_TIME,
    });

    res.status(200).json({
        successMsg: 'LOgged In',
        user: {
            name: fetchedEmployer.primaryContact.fullName,
            company: fetchedEmployer.company.name,
            token,
            expiresIn: JWT_EXPIRY_TIME,
        },
    });
};

exports.employerForgotPwd = async (req, res, next) => {
    if (!req.body.userName) {
        next(EmpError.badRequest('Email not present...'));
    }
    const token = crypto.randomBytes(32).toString('hex');
    const resp = await Employer.updateOne({
        userName: req.body.userName,
    }, {
        $set: {
            resetPwdToken: token,
            resetPwdTokenExpDate: Date.now() + 3600000,
        },
    });
    if (!resp.n) {
        console.log(resp);
        next(EmpError.badRequest('Account with this email ID not found...'));
        return;
    }
    if (!resp.nModified) {
        console.log(resp);
        next(EmpError.badRequest('Not able to change password'));
        return;
    }

    email.send({
            template: 'forgot_password',
            message: {
                to: 'elavarasu.kcg@gmail.com',
            },
            locals: {
                forgotPwdLink: `http://localhost:4200/auth/reset-password/${token}`,
            },
        })
        .then(() => {
            console.log('Email Sent!!!');
            res.status(200).json({
                successMsg: 'Reset Password Email Sent...',
            });
        })
        .catch((err) => console.log('Mailer Issue:', err));
};

exports.employerResetPassword = async (req, res, next) => {
    if (!(req.body.pwdSetToken && req.body.newPassword)) {
        next(EmpError.badRequest('No data received...'));
        return;
    }
    const hash$ = await bcrypt.hash(req.body.newPassword, 10);
    const resp = await Employer.updateOne({
        resetPwdToken: req.body.pwdSetToken,
        resetPwdTokenExpDate: {
            $gt: Date.now(),
        },
    }, {
        $set: {
            password: hash$,
        },
    });
    if (resp.nModified === 0) {
        next(EmpError.badRequest('Invalid Token'));
        return;
    }
    res.status(200).json({
        message: 'Password updated',
    });
};

exports.employerUniqueUsername = async (req, res, next) => {
    if (!req.body.userName) {
        next(EmpError.badRequest('No username found...'));
        return;
    }
    const user = await Employer.findOne({
        userName: req.body.userName,
    });
    if (user) {
        next(EmpError.badRequest('Same username already present'));
        return;
    }
    res.status(200).json({
        successMsg: 'No userfound. Plz proceed...',
    });
};

exports.employerChangePassword = async (req, res, next) => {
    if (!req.body.userID) return;

    const userID = mongoose.Types.ObjectId(req.body.userID);

    const fetchedEmployer = await Employer.findById(userID).select('password');

    const oldHash$ = await bcrypt.compare(req.body.password, fetchedEmployer.password);

    if (!oldHash$) {
        console.log(oldHash$);
        next(EmpError.badRequest('Incorrect password...'));
        return;
    }

    const newHash$ = await bcrypt.hash(req.body.newPassword, 10);

    const resp = await Employer.updateOne({
        _id: userID,
    }, {
        $set: {
            password: newHash$,
        },
    });

    if (!resp.n) {
        console.log(resp);
        next(EmpError.badRequest('Not able to find user'));
        return;
    }

    if (!resp.nModified) {
        console.log(resp);
        next(EmpError.badRequest('Not able to update password'));
        return;
    }

    res.status(200).json({
        successMsg: 'Password Successfully Updated',
    });
};

exports.forTest = (a, b) => a + b;