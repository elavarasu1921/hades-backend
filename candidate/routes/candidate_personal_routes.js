const express = require('express');
const personalInfoController = require('../controllers/candidate_personalInfo_controller');
const jwtValidator = require('../middlewares/jwt_validation');
const resumeController = require('../controllers/candidate_resume_controller');

const router = express.Router();

router.get('/get-prsnlInfo', jwtValidator.jwtValidation, personalInfoController.getPersonalInfo);
router.post('/update-personal-info', jwtValidator.jwtValidation, personalInfoController.updatePersonalInfo);
router.post('/update-contact-info', jwtValidator.jwtValidation, personalInfoController.updateContactInfo);
router.post('/resume-upload', jwtValidator.jwtValidation, resumeController.resumeUpload);

module.exports = router;