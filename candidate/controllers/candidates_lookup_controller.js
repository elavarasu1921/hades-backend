const Lookup = require('../../employer/models/employer_lookup_model');
const CndtError = require('../middlewares/candidate_error_class');

exports.onJobSearch = async (req, res, next) => {
    const fetchedLookups = await Lookup.find({
            name: {
                $in: ['location', 'exprange'],
            },
        })
        .select('name value bdvalue -_id');

    if (!fetchedLookups) {
        console.log(fetchedLookups);
        next(CndtError.badRequest('Not able to retrieve lookup data'));
        return;
    }

    function groupBy(arr, property) {
        return arr.reduce((memo, x) => {
            if (!memo[x[property]]) {
                memo[x[property]] = [];
            }
            memo[x[property]].push(x);
            return memo;
        }, {});
    }

    const brokenArrays = groupBy(fetchedLookups, 'name');
    res.status(200).json(brokenArrays);
};