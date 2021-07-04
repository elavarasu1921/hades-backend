const express = require('express');
const bulkUploadController = require('../controllers/candidate_bulkupload_controller');

const router = express.Router();

router.post('/on-upload', bulkUploadController.resumeBulkUpload);
router.get('/on-getfiles', bulkUploadController.getResumeFiles);

module.exports = router;