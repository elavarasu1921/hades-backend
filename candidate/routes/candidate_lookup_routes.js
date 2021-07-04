const express = require('express');
const lookupController = require('../controllers/candidates_lookup_controller');

const router = express.Router();

router.post('/job-search', lookupController.onJobSearch);

module.exports = router;