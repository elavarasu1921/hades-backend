const express = require('express');
const employerControllers = require('../controllers/admin_employer_controller');

const router = express.Router();

router.get('/get-all-employers', employerControllers.listAllEmployers);
router.post('/get-one-employer', employerControllers.onGetOneEmployer);

module.exports = router;