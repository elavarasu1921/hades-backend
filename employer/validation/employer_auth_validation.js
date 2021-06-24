const Validator = require('validatorjs');

const employerSignUpValidation = formData => {

    const signUpRule = {
        userName: 'string|required',
        password: 'string|required',
        primaryContact: {
            firstName: 'string|required',
            lastName: 'string|required',
            fullName: 'string|required',
            contactNo: 'string|required',
            designation: 'string|required',
        },
        company: {
            name: 'string|required',
            location: {
                city: 'string|required',
                state: 'string|required',
                country: 'string|required',
                combined: 'string|required',
            }
        },
        account: {
            emailValidationToken: 'string|required',
            emailValidationTokenExpiry: 'date|required',
            status: 'string|required',
            createdOn: 'date|required',
            resumes: {
                dailyLimit: 'numeric|required',
            },
            jobs: {
                quota: 'numeric|required',
            }
        }
    }

    const validator = new Validator(formData, signUpRule);
    return validator;

}

const employerLoginValidation = formData => {

    const loginRule = {
        userName: 'string|required',
        password: 'required'
    }

    const validator = new Validator(formData, loginRule);
    return validator;

}

module.exports.employerSignUpValidation = employerSignUpValidation;
module.exports.employerLoginValidation = employerLoginValidation;