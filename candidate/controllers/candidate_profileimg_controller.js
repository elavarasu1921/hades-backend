const multer = require('multer');
const mongoose = require('mongoose');
const crypto = require('crypto');
const Candidate = require('../models/candidate_model');

const DIR = './assets/cndtProfileImages';

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, DIR);
    },
    filename: (req, file, cb) => {
        const fileName = file.originalname.toLowerCase().split(' ').join('-');
        cb(null, `${crypto.randomBytes(3).toString('hex')}_${fileName}`);
    },
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'image/jpg' ||
            file.mimetype === 'image/jpeg' ||
            file.mimetype === 'image/gif' ||
            file.mimetype === 'image/png') {
            cb(null, true);
        } else {
            cb(null, false);
        }
    },
    limits: {
        fileSize: 2 * 1000 * 1000,
    },
});

module.exports.profileImgUpload = (req, res) => {
    const userID = mongoose.Types.ObjectId(req.body.userID);
    return upload.single('profileImg')(req, res, () => {
        const {
            file,
        } = req;
        if (file) {
            Candidate.findByIdAndUpdate(userID, {
                    $set: {
                        'personalInfo.profileImgUrl': req.file.path,
                    },
                })
                .then((resp) => {
                    if (!resp) {
                        console.log(resp);
                        res.status(400).json({
                            errMessage: "Profile Image couldn't be updated",
                        });
                        return;
                    }
                    res.status(200).json(req.file.path);
                })
                .catch((err) => {
                    console.log(err);
                    res.status(400).json({
                        errMessage: 'Issue while uploading profile image',
                    });
                });
        } else {
            console.log('No file');
            res.status(400).json({
                errMessage: 'File should be an image...',
            });
        }
        // next()
    });
};