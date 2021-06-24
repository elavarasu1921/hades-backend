const Validator = require('validatorjs');

const employerAccountValidation = formData => {

    const accountInfoRule = {
        "primaryContact.firstName": 'string|required',
        "primaryContact.lastName": 'string|required',
        "primaryContact.fullName": 'string|required',
        "primaryContact.contactNo": 'string|required',
        "primaryContact.designation": 'string|required',
        "company.location.combined": 'string|required',
        "company.location.country": 'string|required',
        "company.location.address": 'string|required',
        "company.name": 'string|required',
        "company.url": 'string|required',
        "company.linkedIn": 'string',
    }

    const validator = new Validator(formData, accountInfoRule);
    return validator;

}

module.exports = {
    employerAccountValidation
}