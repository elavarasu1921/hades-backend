const express = require('express');
const jobsController = require('../controllers/employer_jobs_controller');
const validate = require('../middlewares/employer_jwt');

const router = express.Router();

router.post('/create', validate.jwtValidation, jobsController.employerJobsCreate);
router.get('/my_jobs', validate.jwtValidation, jobsController.employerMyJobsList);
router.get('/my_jobs_titles', validate.jwtValidation, jobsController.employerGetMyJobsTitles);
router.get('/list_jobs', jobsController.employerAllJobsList);
router.delete('/delete_job', validate.jwtValidation, jobsController.employerJobDelete);
router.get('/postjobs-lookup', jobsController.employerPostJobsLookup);
router.post('/getOneJob', validate.jwtValidation, jobsController.employerGetOneJob);
router.post('/updateJob', validate.jwtValidation, jobsController.employerUpdateJob);
router.post('/get-applicants', validate.jwtValidation, jobsController.getApplicantsforJob);

module.exports = router;