const nodemailer = require('nodemailer');
const Email = require('email-templates');
const path = require('path');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    // host: "smtp.ethereal.email",
    // port: 587,
    // secure: false,
    auth: {
        user: process.env.NODEMAILER_USERNAME,
        pass: process.env.NODEMAILER_PASSWORD,
    },
});

const email = new Email({
    transport: transporter,
    send: true,
    preview: false,
    message: {
        from: process.env.NODEMAILER_USERNAME,
    },
    views: {
        options: {
            extension: 'hbs',
        },
        root: path.join(__dirname, '../assets/emails'),
    },
    juiceResources: {
        preserveImportant: true,
        webResources: {
            relativeTo: path.join(__dirname, '..', 'assets/emails'),
        },
    },
});

module.exports.email = email;