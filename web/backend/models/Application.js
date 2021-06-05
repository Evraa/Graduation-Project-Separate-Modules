const {Schema, model} = require('mongoose');

const applicationSchema = new Schema({
    jobID: {
        type: Schema.Types.ObjectId,
        ref: 'Job',
        required: true
    },
    applicantID: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    answers: {
        type: [{questionID: {type: Schema.Types.ObjectId, ref: 'Question'}, answer: String}],
        required: true,
    },
    resume: {
        type: {url: String, name: String, date: Date}
    },
    video: {
        type: {url: String, name: String, date: Date}
    }
}, {timestamps: true});

const Application = model('Application', applicationSchema);
module.exports = Application;