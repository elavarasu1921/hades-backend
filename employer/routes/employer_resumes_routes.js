const express = require('express');
const router = express.Router();
const validation = require('../middlewares/employer_jwt');
const resumeController = require('../controllers/employer_resumes_controller');

router.post("/search", validation.jwtValidation, resumeController.employerSearchResumes);
router.post("/resume-view", validation.jwtValidation, resumeController.employerOneResumeView);
router.post("/download-resume", validation.jwtValidation, resumeController.empDownloadCndtResume);
router.post("/get-resume-data", validation.jwtValidation, resumeController.getCndtResumeData);
router.get("/getLookup-search", resumeController.getLookupForSearch);

module.exports = router;