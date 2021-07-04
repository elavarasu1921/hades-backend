const CronJob = require('cron').CronJob;
const Employer = require('../models/employer_model');

exports.testCronJob = new CronJob('00 00 00 * * *', async () => {
    console.log('Cron running for resetting daily resume view for employers...');
    let resp = await Employer.updateMany({}, {
        $set: {
            'account.resumes.todayTotal': 0,
        }
    });
    if (resp.nModified !== 0) {
        console.log(`Reset daily resume view count of ${resp.nModified} employer accounts`);
    }
    if (resp.nModified === 0) {
        console.log("error while resetting daily resume view");
    }
}, null, true);

// exports.testCronJob = new CronJob('*/30 * * * * *', async () => {
// }, null, true);