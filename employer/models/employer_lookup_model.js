const mongoose = require('mongoose');

employerLookupSchema = ({
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