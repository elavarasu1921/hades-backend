const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const personalInfoController = require('../controllers/candidate_personalInfo_controller')
const jwtValidator = require('../middlewares/jwt_validation');

const resumeController = require('../controllers/candidate_resume_controller');

router.get('/get-prsnlInfo', jwtValidator.jwt_validation, personalInfoController.getPersonalInfo);
router.post('/update-personal-info', jwtValidator.jwt_validation, personalInfoController.updatePersonalInfo);
router.post('/update-contact-info', jwtValidator.jwt_validation, personalInfoController.updateContactInfo);
router.post('/resume-upload', jwtValidator.jwt_validation, resumeController.resumeUpload);

module.exports = router;