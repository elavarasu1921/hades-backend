const Validator = require('validatorjs');

// SignUp Validation

const signUpValidation = (formData) => {
    const signUpRule = {
        userName: 'email|required',
        password: 'required|string',
        personalInfo: {
            name: {
                firstName: 'required|string',
                lastName: 'required|string',
                fullName: 'required|string',
            },
            contact: {
                no: 'required|string',
            },
            location: {
                city: 'required|string',
                country: 'required|string',
            },
            experience: 'required|numeric',
        },
        professionalInfo: {
            designation: 'required|string',
        },
        account: {
            date: {
                createdOn: 'date|required',
            },
            visibility: 'string|required',
        },
    };

    const validator = new Validator(formData, signUpRule);
    return validator;
};

const loginValidation = (formData) => {
    const loginRule = {
        userName: 'string|required',
        password: 'required',
    };

    const validator = new Validator(formData, loginRule);
    return validator;
};

module.exports.signUpValidation = signUpValidation;
module.exports.loginValidation = loginValidation;