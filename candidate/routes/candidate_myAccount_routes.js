const express = require('express');
const Validation = require('../middlewares/jwt_validation');
const cndtProfileImage = require('../controllers/candidate_profileimg_controller');
const cndtMyAccount = require('../controllers/candidate_myAccount_controller');

const router = express.Router();

router.post('/profile-imgUpload', Validation.jwtValidation, cndtProfileImage.profileImgUpload);
router.get('/getMyAccountInfo', Validation.jwtValidation, cndtMyAccount.getMyAccountInfo);
router.get('/getResumeFile', Validation.jwtValidation, cndtMyAccount.cndtResumeDownload);
router.get('/get-resume-data', Validation.jwtValidation, cndtMyAccount.getResumeData);

module.exports = router;