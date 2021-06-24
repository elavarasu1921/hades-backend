const express = require('express');
const router = express.Router();
const authController = require('../controllers/employer_auth_controller');
const jwtAuthentication = require('../middlewares/employer_jwt');

router.post("/signup", authController.employerSignUp);
router.post("/unique-username", authController.employerUniqueUsername);
router.post("/login", authController.employerLogin);
router.post("/forgot-pwd", authController.employerForgotPwd);
router.post("/reset-password", authController.employerResetPassword);
router.post("/activate-account", authController.employerActivateAccount);
router.post("/resendActMail", authController.employerResendActivationEmail);
router.post("/change-password", jwtAuthentication.jwtValidation, authController.employerChangePassword);

module.exports = router;