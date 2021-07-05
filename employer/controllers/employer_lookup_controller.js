const Lookup = require('../models/employer_lookup_model');

exports.getLookupAdvancedSearch = async (req, res) => {
    const fetchedLookups = await Lookup.find({
            name: {
                $in: ['location', 'exprange'],
            },
        })
        .select('name value bdvalue -_id');

    if (!fetchedLookups) {
        console.log(fetchedLookups);
        res.status(400).json({
            errorMsg: 'Not able to retrieve data',
        });
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