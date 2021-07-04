const express = require('express');
const professionalController = require('../controllers/candidate_professionalInfo_controller');
const {
    jwtValidation,
} = require('../middlewares/jwt_validation');

const router = express.Router();

router.post('/update-professional-info', jwtValidation, professionalController.updateProfessionalInfo);
router.get('/get-professional-info', jwtValidation, professionalController.getProfessionalInfo);

module.exports = router;