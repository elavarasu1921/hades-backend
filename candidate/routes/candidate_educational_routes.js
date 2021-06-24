const express = require('express');
const router = express.Router();
const educationalInfoController = require('../controllers/candidate_educationalInfo_controller');
const jwtValidator = require('../middlewares/jwt_validation');

router.get('/getEduData', jwtValidator.jwt_validation, educationalInfoController.getEducationalData);
router.post('/update-ugInfo', jwtValidator.jwt_validation, educationalInfoController.cndtUpdateUgInfo);
router.post('/update-pgInfo', jwtValidator.jwt_validation, educationalInfoController.cndtUpdatePgInfo);
router.post('/update-certification', jwtValidator.jwt_validation, educationalInfoController.cndtUpdateCertification);

module.exports = router;