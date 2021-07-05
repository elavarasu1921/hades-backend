const Validator = require('validatorjs');

const ugInfoValidation = (formData) => {
    const ugDataValidationRule = {
        degree: 'string',
        university: 'string',
        college: 'string',
        educationType: 'string',
        specialization: 'string',
        YOG: 'numeric',
    };

    const validator = new Validator(formData, ugDataValidationRule);
    return validator;
};

const pgInfoValidation = (formData) => {
    const pgDataValidationRule = {
        degree: 'string',
        university: 'string',
        college: 'string',
        educationType: 'string',
        specialization: 'string',
        YOG: 'numeric',
    };

    const validator = new Validator(formData, pgDataValidationRule);
    return validator;
};

const certificationInfoValidation = (formData) => {
    const certificationDataValidationRule = {
        one: {
            name: 'string',
            institute: 'string',
            year: 'numeric',
        },
        two: {
            name: 'string',
            institute: 'string',
            year: 'numeric',
        },
    };

    const validator = new Validator(formData, certificationDataValidationRule);
    return validator;
};

module.exports.ugInfoValidation = ugInfoValidation;
module.exports.pgInfoValidation = pgInfoValidation;
module.exports.certificationInfoValidation = certificationInfoValidation;