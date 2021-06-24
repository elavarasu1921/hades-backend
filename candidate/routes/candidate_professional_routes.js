const express = require('express');
const router = express.Router();
const professionalController = require('../controllers/candidate_professionalInfo_controller');
const {
    jwt_validation
} = require('../middlewares/jwt_validation');

router.post('/update-professional-info', jwt_validation, professionalController.updateProfessionalInfo);
router.get('/get-professional-info', jwt_validation, professionalController.getProfessionalInfo);

module.exports = router;