const Validator = require('validatorjs');

const createJobsValidation = formdata => {

    const createJobsValidationRule = {
        title: 'required',
        userID: 'string|required',
        contact: {
            name: 'string',
            no: 'numeric',
            email: 'string',
        },
        info: {
            skills: 'array',
            expRange: 'string',
            domain: 'string',
            salRange: 'string',
            designation: 'string',
            jobType: 'string',
            client: 'string',
            company: 'string',
        },
        apply: {
            url: 'string',
        },
        description: 'string|required',
        qualification: 'string',
        location: {
            combined: 'string',
            country: 'string'
        }
    }

    const validator = new Validator(formdata, createJobsValidationRule);
    return validator;

}

const getMyJobsValidation = formdata => {

    const getMyJobsValidationRule = {
        userID: 'required',
        currentPage: 'required',
        itemsPerPage: 'required',
    }

    const validator = new Validator(formdata, getMyJobsValidationRule);
    return validator;

}

module.exports.createJobsValidation = createJobsValidation;
module.exports.getMyJobsValidation = getMyJobsValidation;