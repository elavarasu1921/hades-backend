const express = require('express');
const router = express.Router();
const Validation = require('../middlewares/jwt_validation');
const cndtProfileImage = require('../controllers/candidate_profileimg_controller');
const cndtMyAccount = require('../controllers/candidate_myAccount_controller');

router.post("/profile-imgUpload", Validation.jwt_validation, cndtProfileImage.profileImgUpload);
router.get("/getMyAccountInfo", Validation.jwt_validation, cndtMyAccount.getMyAccountInfo);
router.get("/getResumeFile", Validation.jwt_validation, cndtMyAccount.cndtResumeDownload);
router.get("/get-resume-data", Validation.jwt_validation, cndtMyAccount.getResumeData);

module.exports = router;