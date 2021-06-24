const express = require('express');
const router = express.Router();
const employerControllers = require('../controllers/admin_employer_controller');

router.get('/get-all-employers', employerControllers.listAllEmployers);
router.post('/get-one-employer', employerControllers.onGetOneEmployer);

module.exports = router;