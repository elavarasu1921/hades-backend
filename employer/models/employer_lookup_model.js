const mongoose = require('mongoose');

const employerLookupSchema = ({
    name: {
        type: String,
    },
    bdvalue: {
        type: String,
    },
    value: {
        type: String,
    },
});

module.exports = mongoose.model('Lookup', employerLookupSchema);