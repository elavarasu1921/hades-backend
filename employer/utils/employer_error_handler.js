const empError = require('./employer_error_class');

/* eslint "no-unused-vars": "off" */
function errorHandler(err, req, res, next) {
    console.log(err);

    if (err instanceof empError) {
        res.status(err.code).json({
            errorMsg: err.message,
        });
        return;
    }

    res.status(500).json({
        errorMsg: 'Something Failed...',
    });
}

module.exports = errorHandler;