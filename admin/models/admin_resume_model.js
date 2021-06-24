const mongoose = require('mongoose');

const adminResumeSchema = mongoose.Schema({
    cndtID: String,
    name: String,
    email: String,
    phone: String,
    summary: String,
    skills: String,
    education: String,
    certification: String,
    experience: String,
    technology: String,
    experience: String,
})

module.exports = mongoose.model("AdminResume", adminResumeSchema);