const express = require('express');
const router = express.Router();

const adminJobRoutes = require('../admin/routes.js/admin_jobs_routes');
const adminEmployerRoutes = require('../admin/routes.js/admin_employer_routes');

router.use('/jobs', adminJobRoutes);
router.use('/employers', adminEmployerRoutes);

module.exports = router;