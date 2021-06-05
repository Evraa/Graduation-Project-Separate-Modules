const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
    jobID: {
        type: mongoose.ObjectId,
        required: true
    },
    applicantID: {
        type: mongoose.ObjectId,
        required: true
    },
    answers: {
        type: [{questionID: mongoose.ObjectId, answer: String}],
        required: true,
    },
    resume: {
        type: {url: String, name: String, date: Date}
    },
    video: {
        type: {url: String, name: String, date: Date}
    }
}, {timestamps: true});

const Application = mongoose.model('Application', applicationSchema);
module.exports = Application;