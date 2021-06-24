const express = require('express');
const router = express.Router()
const lookupController = require('../controllers/candidates_lookup_controller')

router.post('/job-search', lookupController.onJobSearch)

module.exports = router;