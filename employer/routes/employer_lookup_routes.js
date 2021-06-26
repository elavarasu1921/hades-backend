const express = require('express');
const router = express.Router();
const lookupControllers = require('../controllers/employer_lookup_controller');

router.get("/resume-search", lookupControllers.getLookupAdvancedSearch);

module.exports = router;