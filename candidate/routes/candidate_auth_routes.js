const express = require('express');
const isAuth = require('../validation/is_auth');
const authController = require('../controllers/candidate_auth_controller');
const {
    jwtValidation,
} = require('../middlewares/jwt_validation');

const router = express.Router();

router.post('/signup', isAuth, authController.signup);
router.post('/check-unique-username', authController.candidateCheckUniqueUsername);
router.post('/activate-account', authController.candidateAccountActivate);
router.post('/login', authController.login);
router.post('/forgot-password', authController.candidateForgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/change-password', jwtValidation, authController.candidateChangePassword);

module.exports = router;