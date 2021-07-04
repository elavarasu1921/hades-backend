const express = require('express');

const router = express.Router();

const cndtLookupRoutes = require('../candidate/routes/candidate_lookup_routes');
const authRoutes = require('../candidate/routes/candidate_auth_routes');
const jobRoutes = require('../candidate/routes/candidate_jobs_routes');
const myAccountRoutes = require('../candidate/routes/candidate_myAccount_routes');
const personalRoutes = require('../candidate/routes/candidate_personal_routes');
const educationalRoutes = require('../candidate/routes/candidate_educational_routes');
const professionalRoutes = require('../candidate/routes/candidate_professional_routes');
const bulkUploadRoutes = require('../candidate/routes/candidate_bulkupload_routes');

router.use('/auth', authRoutes);
router.use('/personal', personalRoutes);
router.use('/jobs', jobRoutes);
router.use('/myAccount', myAccountRoutes);
router.use('/educational', educationalRoutes);
router.use('/professional', professionalRoutes);
router.use('/lookup', cndtLookupRoutes);
router.use('/bulk_upload', bulkUploadRoutes);

module.exports = router;