const express = require('express');
const router = express.Router();
const adminJobsController = require('../controllers/admin_job_controller');

router.post('/get-submitted', adminJobsController.getAllSubmittedJobs);
router.post('/get-onejob', adminJobsController.getOneJobInfo);
router.post('/approve-job', adminJobsController.onApproveJob);
router.post('/reject-job', adminJobsController.onRejectJob);
router.post('/expire-job', adminJobsController.onExpireJob);

module.exports = router;