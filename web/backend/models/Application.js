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
    users: [mongoose.ObjectId],
    answers: {
        type: [{questionID: mongoose.ObjectId, answer: String}],
        required: true,
    },
    resume: {
        type: String,
        required: true,
    },
    video: String
}, {timestamps: true});

const Application = mongoose.model('Application', applicationSchema);
module.exports = Application;