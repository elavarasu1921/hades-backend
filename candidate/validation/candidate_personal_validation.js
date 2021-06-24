const Validator = require('validatorjs');

const personalInfoValidation = formData => {

    const personalInfoRule = {
        'personalInfo.name.firstName': 'required|string',
        'personalInfo.name.lastName': 'required|string',
        'personalInfo.name.fullName': 'required|string',
        'personalInfo.gender': 'string',
        'personalInfo.maritalStatus': 'string',
        'personalInfo.phyDisabled': 'boolean',
        'personalInfo.experience': 'numeric',
    }

    const validator = new Validator(formData, personalInfoRule);
    return validator;

}

const contactInfoValidation = formData => {

    const contactInfoRule = {
        'personalInfo.contact.no': 'numeric|required',
        'personalInfo.contact.skypeID': 'string',
        'personalInfo.location.combined': 'string|required',
        'personalInfo.location.country': 'string|required',
        'personalInfo.socialMedia.linkedIn': 'string',
    };

    const validator = new Validator(formData, contactInfoRule);
    return validator;
}

module.exports.personalInfoValidation = personalInfoValidation;
module.exports.contactInfoValidation = contactInfoValidation;