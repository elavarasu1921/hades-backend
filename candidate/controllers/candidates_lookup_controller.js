const Lookup = require('../../employer/models/employer_lookup_model');

exports.onJobSearch = async (req, res, next) => {
    console.log('working', req.body);
    let fetchedLookups = await Lookup.aggregate([{
        $match: {
            $or: [{
                name: 'location'
            }, {
                name: 'country'
            }]
        }
    }, {
        $group: {
            _id: {
                type: "$name"
            }
        }
    }])
    console.log('', fetchedLookups);
    res.json({
        asdf: 'wer'
    })
}