const multer = require('multer');
const mongoose = require('mongoose');
const ResumeParser = require('simple-resume-parser');
const {
    convertWordFiles,
} = require('convert-multiple-files');
const crypto = require('crypto');
const AdminResume = require('../../admin/models/admin_resume_model');
const CndtError = require('../middlewares/candidate_error_class');

const DIR = './assets/cndtResumes';

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, DIR);
    },
    filename: (req, file, cb) => {
        const fileName = file.originalname.toLowerCase().split(' ').join('-');
        cb(null, `${crypto.randomBytes(3).toString('hex')}_${fileName}`);
    },
});

const Candidate = require('../models/candidate_model');

// File Mime Types

const docx = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
const doc = 'application/msword';
const rtf = 'application/rtf';
const pdf = 'application/pdf';
const odt = 'application/vnd.oasis.opendocument.text';

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === pdf ||
            file.mimetype === rtf ||
            file.mimetype === doc ||
            file.mimetype === odt ||
            file.mimetype === docx) {
            cb(null, true);
        } else {
            cb(null, false);
        }
    },
    limits: {
        fileSize: 5 * 1000 * 1000,
    },
});

module.exports.resumeUpload = (req, res, next) => {
    if (!req.body.userID) return;
    const userID = mongoose.Types.ObjectId(req.body.userID);

    upload.single('resume')(req, res, () => {
        const {
            file,
        } = req;
        if (!file) {
            next(CndtError.badRequest('No file found'));
            return;
        }

        (async () => {
            let parsingFilePath;

            if (file.mimetype === doc || file.mimetype === odt) {
                const newPath = await convertWordFiles(file.path, 'docx', 'assets/cndtResumes/converted');
                file.convertedPath = newPath;
                parsingFilePath = file.convertedPath;
            }

            if (file.mimetype === docx) {
                parsingFilePath = file.path;
            }
            const resp = await Candidate.updateOne({
                _id: userID,
            }, {
                $set: {
                    'resume.originalUrl': file.path,
                    'resume.convertedUrl': parsingFilePath,
                    'resume.savedName': file.filename,
                    'resume.originalName': file.originalname,
                    'resume.mimeType': file.mimetype,
                },
            });

            if (resp.nModified === 0) {
                console.log(resp);
                next(CndtError.badRequest('Candidate not updated'));
                return;
            }

            const resume = new ResumeParser(parsingFilePath);

            const parsedResume = await resume.parseToJSON();

            const createdAdminResume = {
                cndtID: userID,
                name: parsedResume.parts.name,
                emailID: parsedResume.parts.email,
                contactNo: parsedResume.parts.phone,
                summary: parsedResume.parts.summary,
                skills: parsedResume.parts.skills,
                certification: parsedResume.parts.certification,
                education: parsedResume.parts.education,
                experience: parsedResume.parts.experience,
            };

            const respOnUpdate = await AdminResume.updateOne({
                cndtID: userID,
            }, createdAdminResume);

            console.log('', respOnUpdate);

            res.status(200).json({
                successMsg: 'Resume Updated',
            });
        })();
    });
    // next()
};