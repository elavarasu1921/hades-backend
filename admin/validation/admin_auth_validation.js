const Validator = require('validatorjs');

const registerValidation = (formData) => {
    const registerValidationRule = {
        userName: 'string|required',
        password: 'string|required',
        role: 'string|required',
        account: {
            status: 'string|required',
            registerdOn: 'string|required',
        },
    };

    const validator = new Validator(formData, registerValidationRule);
    return validator;
};

module.exports.registerValidation = registerValidation;