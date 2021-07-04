const express = require('express');
const jobsController = require('../controllers/candidate_jobs_controller');
const jwtValidator = require('../middlewares/jwt_validation');

const router = express.Router();

router.post('/get-results', jobsController.getJobResults);
router.post('/get-job', jwtValidator.partialJwtValidation, jobsController.getOneJob);
router.post('/on-apply', jwtValidator.jwtValidation, jobsController.onApplyToJob);

module.exports = router;