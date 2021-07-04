const express = require('express');
const educationalInfoController = require('../controllers/candidate_educationalInfo_controller');
const {
    jwtValidation,
} = require('../middlewares/jwt_validation');

const router = express.Router();

router.get('/getEduData', jwtValidation, educationalInfoController.getEducationalData);
router.post('/update-ugInfo', jwtValidation, educationalInfoController.cndtUpdateUgInfo);
router.post('/update-pgInfo', jwtValidation, educationalInfoController.cndtUpdatePgInfo);
router.post('/update-certification', jwtValidation, educationalInfoController.cndtUpdateCertification);

module.exports = router;