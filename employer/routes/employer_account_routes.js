const express = require('express');
const router = express.Router();

const accountsController = require('../controllers/employer_account_controller');
const validator = require('../middlewares/employer_jwt');

router.get("/getAccInfo", validator.jwtValidation, accountsController.getEmployerInfo);
router.post("/updateAccInfo", validator.jwtValidation, accountsController.employerInfoUpdate);

module.exports = router;