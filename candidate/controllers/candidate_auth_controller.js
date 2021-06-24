const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const {
    signUpValidation,
    loginValidation
} = require('../validation/candidate_auth_validation');
const Candidate = require('../models/candidate_model');
const mongoose = require('mongoose');

let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'elavarasu.kcg@gmail.com',
        pass: 'tamilmagan'
    }
})

const TOKEN_EXPIRY_TIME = 3600;

exports.signup = async (req, res, next) => {

    let createdUser = {
        userName: req.body.formValue.userName,
        password: req.body.formValue.password,
        personalInfo: {
            name: {
                firstName: req.body.formValue.firstName,
                lastName: req.body.formValue.lastName,
                fullName: req.body.formValue.firstName + ' ' + req.body.formValue.lastName,
            },
            contact: {
                no: req.body.formValue.contactNo,
            },
            location: {
                city: req.body.formValue.city,
                country: req.body.formValue.country
            },
            experience: req.body.formValue.experience
        },
        professionalInfo: {
            designation: req.body.formValue.designation,
        },
        account: {
            emailValidationToken: require('crypto').randomBytes(32).toString('hex'),
            emailValidationTokenExpiry: Date.now() + TOKEN_EXPIRY_TIME,
            status: 'EmailPendingValidation',
            date: {
                createdOn: Date.now(),
            },
            visibility: 'Visible',
        }
    }

    const result = signUpValidation(createdUser);

    if (result.fails()) {
        console.log(result.errors.all());
        res.status(400).json({
            errorMsg: 'Validation Failed',
        })
        return;
    }

    let hash$ = await bcrypt.hash(createdUser.password, 10);
    createdUser.password = hash$;

    const candidate = new Candidate(createdUser);
    let resp = await candidate.save()

    if (!resp) {
        console.log(resp);
        res.status(400).json({
            errorMsg: 'Not able to created user',
        })
        return;
    }

    let mailOptions = {
        from: 'elavarasu.kcg@gmail.com',
        to: 'elavarasu.kcg@gmail.com',
        // to: createdUser.userName,
        subject: 'Thanks for Registering',
        html: `
                <p>Account successfully registered...</p>
                <p>Please click this <a href="http://localhost:4200/auth/activate-account/${resp.account.emailValidationToken}">link</a> to activate your account.</p>
                `
    };

    transporter.sendMail(mailOptions, (err, data) => {
        if (err) {
            console.log(err);
            res.status(400).json({
                errorMsg: 'Not able to send activation mail',
            })
            return;
        } else {
            console.log('Email Sent', data);
            res.status(200).json({
                message: 'User Added',
            })
        }
    })

};

exports.candidateCheckUniqueUsername = async (req, res, next) => {
    if (!req.body.userName) {
        console.log(req.body);
        res.status(400).json({
            errorMsg: 'Not enough data',
        })
        return;
    }
    let resp = await Candidate.findOne({
        userName: req.body.userName,
    }).select('_id')
    if (resp) {
        console.log(resp);
        res.status(400).json({
            errorMsg: 'Candidate username already present',
        })
        return;
    }
    res.status(200).json({
        successMsg: 'Username not present. Plz proceed..'
    })
};

exports.candidateAccountActivate = async (req, res, next) => {

    if (!req.body.activationID) {
        console.log(req.body);
        res.status(400).json({
            errorMsg: 'Not enough data',
        })
        return;
    }

    let resp = await Candidate.updateOne({
        "account.emailValidationToken": req.body.activationID,
    }, {
        $set: {
            "account.status": "Active"
        }
    })

    if (!resp.nModified) {
        console.log(resp);
        res.status(400).json({
            errorMsg: 'Not able to activate account',
        })
        return;
    }
    res.status(200).json({
        successMsg: 'Account Activated'
    })
};

exports.login = async (req, res, next) => {

    const result = loginValidation(req.body);

    if (result.fails()) {
        console.log(result.errors.all());
        res.status(400).json({
            errorMsg: 'Validation Failed',
        })
        return;
    }

    const {
        userName,
        password
    } = req.body;

    let fetchedCandidate = await Candidate.findOne({
            userName
        })
        .select(`
            userName
            password
            personalInfo.location.combined
            personalInfo.profileImgUrl
            personalInfo.name.fullName
            professionalInfo.current.designation`);
    if (!fetchedCandidate) {
        return res.status(400).json({
            errorMsg: 'User Not Found'
        })
    }
    let bcryptResult = await bcrypt.compare(password, fetchedCandidate.password);
    if (!bcryptResult) {
        return res.status(400).json({
            errorMsg: 'Please check your login credentials...'
        })
    }

    const token = jwt.sign({
        userName,
        userID: new mongoose.Types.ObjectId(fetchedCandidate._id)
    }, process.env.JWT_SECRET_KEY, {
        expiresIn: TOKEN_EXPIRY_TIME
    })
    res.status(200).json({
        user: {
            name: fetchedCandidate.personalInfo.name.fullName,
            designation: fetchedCandidate.professionalInfo.current.designation,
            location: fetchedCandidate.personalInfo.location.combined,
            profileImgUrl: fetchedCandidate.personalInfo.profileImgUrl,
            token: token,
        },
    })
};

exports.candidateForgotPassword = async (req, res, next) => {
    if (!req.body.userName) {
        res.json({
            message: 'Email ID not valid'
        })
    }

    let token = crypto.randomBytes(32).toString('hex');

    let resp = await Candidate.updateOne({
        userName: req.body.userName
    }, {
        $set: {
            resetPwdToken: token,
            resetPwdTokenExpDate: Date.now() + TOKEN_EXPIRY_TIME,
        }
    })

    if (!resp.n) {
        console.log(resp);
        res.status(400).json({
            errorMsg: 'No candidate available with this email ID',
        })
        return;
    }

    if (!resp.nModified) {
        console.log(resp);
        res.status(400).json({
            errorMsg: 'Not able to update candidate',
        })
        return;
    }

    let mailOptions = {
        from: 'elavarasu.kcg@gmail.com',
        to: 'elavarasu.kcg@gmail.com',
        // to: req.body.userName,
        subject: 'Password Reset',
        html: `
            <p>You requested a password reset</p>
            <p>Click this <a href="http://localhost:4200/auth/reset-password/${token}">link</a> to reset your password</p>
        `
    }
    transporter.sendMail(mailOptions, (err, data) => {
        if (err) {
            (err) => {
                console.log(err);
                res.status(400).json({
                    errorMsg: 'Not able to send email',
                })
            };
        } else {
            res.status(200).json({
                successMsg: 'Email Sent Successfully',
            })
        }
    })

};

exports.resetPassword = async (req, res, next) => {
    console.log(req.body);
    if (!req.body.resetID) {
        res.status(400).json({
            message: 'No data received'
        })
        return;
    }
    let hash$ = await bcrypt.hash(req.body.password, 10);

    let resp = await Candidate.updateOne({
        resetPwdToken: req.body.resetID,
        // resetPwdTokenExpDate: {
        //     $gt: new Date(),
        // }
    }, {
        password: hash$,
    })

    if (!resp.n) {
        console.log(resp);
        res.status(400).json({
            errorMsg: 'No Candidate Found',
        })
        return;
    }

    if (!resp.nModified) {
        console.log(resp);
        res.status(400).json({
            errorMsg: 'Not able to update password',
        })
        return;
    }

    res.status(200).json({
        successMsg: 'Candidate Password Successfully Updated'
    })
}