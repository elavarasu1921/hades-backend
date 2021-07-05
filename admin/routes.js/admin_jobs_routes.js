const express = require('express');
const adminJobsController = require('../controllers/admin_job_controller');

const router = express.Router();

router.post('/get-submitted', adminJobsController.getAllSubmittedJobs);
router.post('/get-onejob', adminJobsController.getOneJobInfo);
router.post('/approve-job', adminJobsController.onApproveJob);
router.post('/reject-job', adminJobsController.onRejectJob);
router.post('/expire-job', adminJobsController.onExpireJob);

module.exports = router;