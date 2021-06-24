const express = require('express');
const router = express.Router();
const isAuth = require('../validation/is_auth');
const authController = require('../controllers/candidate_auth_controller');

router.post("/signup", isAuth, authController.signup);
router.post("/check-unique-username", authController.candidateCheckUniqueUsername);
router.post("/activate-account", authController.candidateAccountActivate);
router.post("/login", authController.login);
router.post("/forgot-password", authController.candidateForgotPassword);
router.post("/reset-password", authController.resetPassword);

module.exports = router;