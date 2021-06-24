const express = require('express');
const router = express.Router();

const employerAuthRoutes = require('../employer/routes/employer_auth_routes')
const employerJobRoutes = require('../employer/routes/employer_jobs_routers');
const employerResumeRoutes = require('../employer/routes/employer_resumes_routes');
const employerAccountRoutes = require('../employer/routes/employer_account_routes');

router.use('/auth', employerAuthRoutes);
router.use('/jobs', employerJobRoutes);
router.use('/resumes', employerResumeRoutes);
router.use('/account', employerAccountRoutes);

module.exports = router;