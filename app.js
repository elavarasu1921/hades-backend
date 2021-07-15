const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const bodyParser = require('body-parser');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');

const candidateRoutes = require('./al_routes/candidate_routes');
const employerRoutes = require('./al_routes/employer_routes');
const adminRoutes = require('./al_routes/admin_routes');

// Error Handler
const CndtErrorHandler = require('./candidate/middlewares/candidate_error_handler');
const EmpErrorHandler = require('./employer/utils/employer_error_handler');

const publicDir = path.join(__dirname, 'assets');

/* eslint "no-unused-vars": "off" */
const candidateCronJobs = require('./candidate/utils/cron_jobs');
const employerCronJobs = require('./employer/utils/cron_jobs');

const app = express();

mongoose.connect(process.env.SERVER_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        useFindAndModify: false,
    })
    .then(() => console.log('DB Connected!!!'))
    .catch((err) => console.log('DB Connection Failed:', err));

app.use(helmet());
app.use(compression());

app.use('/assets', express.static(publicDir));

app.use(bodyParser.json());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, POST, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, x-Requested-With, Content-Type, Accept, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

app.use('/cndtApi', candidateRoutes);
app.use('/empApi', employerRoutes);
app.use('/admApi', adminRoutes);

// Error Handlers
app.use('/cndtApi', CndtErrorHandler);
app.use('/empApi', EmpErrorHandler);

module.exports = app;