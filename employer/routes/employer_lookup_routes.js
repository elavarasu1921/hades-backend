const express = require('express');
const lookupControllers = require('../controllers/employer_lookup_controller');

const router = express.Router();

router.get('/resume-search', lookupControllers.getLookupAdvancedSearch);

module.exports = router;