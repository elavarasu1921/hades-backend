const Validator = require('validatorjs');

const professionalInfoValidation = (formData) => {
    const professionalInfoRule = {
        'professionalInfo.profileTitle': 'string',
        'professionalInfo.coverLetter': 'string',
        'professionalInfo.relocation': 'string',
        'professionalInfo.domain': 'string',
        'professionalInfo.current.designation': 'string',
        'professionalInfo.current.salary': 'string',
        'professionalInfo.current.company': 'string',
        'professionalInfo.expected.designation': 'string',
        'professionalInfo.expected.salary': 'string',
        'professionalInfo.expected.cities': 'array',
        'professionalInfo.skillsList': 'array',
        'professionalInfo.noticePeriod': 'string',
    };

    const validator = new Validator(formData, professionalInfoRule);
    return validator;
};

module.exports.professionalInfoValidation = professionalInfoValidation;