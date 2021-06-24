const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const jobsController = require('../controllers/candidate_jobs_controller');
const jwtValidator = require('../middlewares/jwt_validation');

router.post('/get-results', jobsController.getJobResults);
router.post('/get-job', jwtValidator.partialJWT_validation, jobsController.getOneJob);
router.post('/on-apply', jwtValidator.jwt_validation, jobsController.onApplyToJob)

module.exports = router;