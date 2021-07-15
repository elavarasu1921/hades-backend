const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const {
    signUpValidation,
    loginValidation,
} = require('../validation/candidate_auth_validation');
const Candidate = require('../models/candidate_model');
const {
    email,
} = require('../utils/candidate_mailing');
const io = require('../../socket');
const CndtError = require('../middlewares/candidate_error_class');

const TOKEN_EXPIRY_TIME = 3600;

exports.signup = async (req, res, next) => {
    const createdUser = {
        userName: req.body.formValue.userName,
        password: req.body.formValue.password,
        personalInfo: {
            name: {
                firstName: req.body.formValue.firstName,
                lastName: req.body.formValue.lastName,
                fullName: `${req.body.formValue.firstName} ${req.body.formValue.lastName}`,
            },
            contact: {
                no: req.body.formValue.contactNo,
            },
            location: {
                city: req.body.formValue.city,
                country: req.body.formValue.country,
            },
            experience: req.body.formValue.experience,
        },
        professionalInfo: {
            designation: req.body.formValue.designation,
        },
        account: {
            emailValidationToken: crypto.randomBytes(32).toString('hex'),
            emailValidationTokenExpiry: Date.now() + TOKEN_EXPIRY_TIME,
        },
    };

    const result = signUpValidation(createdUser);

    if (result.fails()) {
        console.log(result.errors.all());
        next(CndtError.badRequest('Validation Error'));
        return;
    }

    const hash$ = await bcrypt.hash(createdUser.password, 10);
    createdUser.password = hash$;

    const candidate = new Candidate(createdUser);
    const resp = await candidate.save();

    if (!resp) {
        console.log(resp);
        next(CndtError.badRequest('Not able to created user...'));
        return;
    }

    email.send({
            template: 'forgot_password',
            message: {
                to: 'elavarasu.kcg@gmail.com',
            },
            locals: {
                activationLink: `http://localhost:4200/auth/activate-account/${resp.account.emailValidationToken}`,
            },
        })
        .then(() => {
            console.log('Email Sent!!!');
            res.status(200).json({
                successMsg: 'Reset Password Email Sent...',
            });
        })
        .catch((err) => {
            console.log('Mailer Issue:', err);
            next(CndtError.badRequest('error sending activation email'));
        });
};

exports.candidateCheckUniqueUsername = async (req, res, next) => {
    if (!req.body.userName) {
        console.log(req.body);
        next(CndtError.badRequest('Not Enough Data'));
        return;
    }
    const resp = await Candidate.findOne({
        userName: req.body.userName,
    }).select('_id');
    if (resp) {
        console.log(resp);
        next(CndtError.badRequest('Candidate username already present'));
        return;
    }
    res.status(200).json({
        successMsg: 'Username not present. Plz proceed..',
    });
};

exports.candidateAccountActivate = async (req, res, next) => {
    if (!req.body.activationID) {
        console.log(req.body);
        next(CndtError.badRequest('Not Enough Data...'));
        return;
    }

    const resp = await Candidate.updateOne({
        'account.emailValidationToken': req.body.activationID,
    }, {
        $set: {
            'account.status': 'Active',
        },
    });

    if (!resp.nModified) {
        console.log(resp);
        next(CndtError.badRequest('Not able to activate account'));
        return;
    }

    res.status(200).json({
        successMsg: 'Account Activated',
    });
};

exports.login = async (req, res, next) => {
    const result = loginValidation(req.body);

    if (result.fails()) {
        console.log(result.errors.all());
        next(CndtError.badRequest('Validation Failed...'));
        return;
    }

    const {
        userName,
        password,
    } = req.body;

    const fetchedCandidate = await Candidate.findOne({
            userName,
        })
        .select(`
            userName
            password
            personalInfo.location.combined
            personalInfo.profileImgUrl
            personalInfo.name.fullName
            professionalInfo.current.designation`);

    if (!fetchedCandidate) {
        next(CndtError.badRequest('No User Found'));
        return;
    }

    const bcryptResult = await bcrypt.compare(password, fetchedCandidate.password);

    if (!bcryptResult) {
        next(CndtError.badRequest('Please check your login credentials...'));
        return;
    }

    const token = jwt.sign({
        userName,
        userID: new mongoose.Types.ObjectId(fetchedCandidate._id),
    }, process.env.JWT_SECRET_KEY, {
        expiresIn: TOKEN_EXPIRY_TIME,
    });

    io.getIO().emit('login', {
        action: 'loggedIn',
        username: 'asdf',
    });

    res.status(200).json({
        user: {
            name: fetchedCandidate.personalInfo.name.fullName,
            designation: fetchedCandidate.professionalInfo.current.designation,
            location: fetchedCandidate.personalInfo.location.combined,
            profileImgUrl: fetchedCandidate.personalInfo.profileImgUrl,
            token,
        },
    });
};

exports.candidateForgotPassword = async (req, res, next) => {
    if (!req.body.userName) {
        next(CndtError.badRequest('Email ID is not valid'));
        return;
    }

    try {
        const token = crypto.randomBytes(32).toString('hex');

        const resp = await Candidate.updateOne({
            userName: req.body.userName,
        }, {
            $set: {
                resetPwdToken: token,
                resetPwdTokenExpDate: Date.now() + TOKEN_EXPIRY_TIME,
            },
        });

        if (!resp.n) {
            console.log(resp);
            next(CndtError.badRequest('No candidate available with this email ID'));
            return;
        }

        if (!resp.nModified) {
            console.log(resp);
            next(CndtError.badRequest('Not able to update candidate'));
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
    } catch (error) {
        console.log('', error);
        next(CndtError.badRequest('Not able to update candidate'));
    }
};

exports.resetPassword = async (req, res, next) => {
    if (!req.body.resetID) {
        next(CndtError.badRequest('No data received'));
        return;
    }
    const hash$ = await bcrypt.hash(req.body.password, 10);

    const resp = await Candidate.updateOne({
        resetPwdToken: req.body.resetID,
        // resetPwdTokenExpDate: {
        //     $gt: new Date(),
        // }
    }, {
        password: hash$,
    });

    if (!resp.n) {
        console.log(resp);
        next(CndtError.badRequest('No Candidate Found'));
        return;
    }

    if (!resp.nModified) {
        console.log(resp);
        next(CndtError.badRequest('Not able to update password'));
        return;
    }

    res.status(200).json({
        successMsg: 'Candidate Password Successfully Updated',
    });
};

exports.candidateChangePassword = async (req, res, next) => {
    const userID = mongoose.Types.ObjectId(req.body.userID);

    if (req.body.newPassword !== req.body.confNewPassword) {
        console.log(req.body);
        next(CndtError.badRequest('Passwords dont match...'));
        return;
    }

    const retrievedPwd = await Candidate.findById(userID, 'password');

    const bcryptResult = await bcrypt.compare(req.body.currentPassword, retrievedPwd.password);

    if (!bcryptResult) {
        console.log(bcryptResult);
        next(CndtError.badRequest('Check credentials...'));
        return;
    }

    const hash$ = await bcrypt.hash(req.body.newPassword, 10);

    const resp = await Candidate.findByIdAndUpdate(userID, {
        $set: {
            password: hash$,
        },
    });

    if (resp.nModified === 0) {
        console.log(resp);
        next(CndtError.badRequest('Not able to update password...'));
        return;
    }

    res.status(200).json({
        successMsg: 'Password updated...',
    });
};