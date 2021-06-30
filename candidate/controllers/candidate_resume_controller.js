const multer = require('multer');
const mongoose = require('mongoose');
const DIR = './assets/cndtResumes';
const ResumeParser = require('simple-resume-parser');
const AdminResume = require('../../admin/models/admin_resume_model');
const {
    convertWordFiles
} = require('convert-multiple-files');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, DIR)
    },
    filename: (req, file, cb) => {
        const fileName = file.originalname.toLowerCase().split(' ').join('-')
        cb(null, require('crypto').randomBytes(3).toString('hex') + '_' + fileName)
    }
})

const Candidate = require('../models/candidate_model');

// File Mime Types 

const docx = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
const doc = 'application/msword';
const rtf = 'application/rtf';
const pdf = 'application/pdf';
const odt = 'application/vnd.oasis.opendocument.text';

const upload = multer({
    storage: storage,
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
        fileSize: 5 * 1000 * 1000
    }
})

module.exports.resumeUpload = (req, res, next) => {

    if (!req.body.userID) return;
    let userID = mongoose.Types.ObjectId(req.body.userID);

    upload.single('resume')(req, res, () => {
        const file = req.file;
        if (!file) {
            console.log('No file found');
            res.status(400).json({
                errorMsg: "No file found"
            })
        }

        (async () => {

            let parsingFilePath;

            if (file.mimetype === doc || file.mimetype === odt) {
                let newPath = await convertWordFiles(file.path, 'docx', 'assets/cndtResumes/converted');
                file.convertedPath = newPath;
                parsingFilePath = file.convertedPath;
            }

            if (file.mimetype === docx) {
                parsingFilePath = file.path;
            }
            let resp = await Candidate.updateOne({
                _id: userID
            }, {
                $set: {
                    'resume.originalUrl': file.path,
                    'resume.convertedUrl': parsingFilePath,
                    'resume.savedName': file.filename,
                    'resume.originalName': file.originalname,
                    'resume.mimeType': file.mimetype,
                }
            });

            if (resp.nModified = 0) {
                console.log(resp);
                res.status(400).json({
                    errorMsg: 'Candidate not updated',
                })
            }

            const resume = new ResumeParser(parsingFilePath);

            let parsedResume = await resume.parseToJSON();

            let createdAdminResume = {
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
                cndtID: userID
            }, createdAdminResume)

            res.status(200).json({
                successMsg: 'Resume Updated'
            });

        })()

    })
    // next()
}