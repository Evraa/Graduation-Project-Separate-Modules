const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    questions: {
        type: [{body: String, ID: mongoose.ObjectId, required: Boolean}],
        required: true
    },
    videoRequired: {
        type: Boolean,
        required: true
    },
    applicationIDs: [mongoose.ObjectId],
    analyzedData: [mongoose.ObjectId]
}, {timestamps: true});

const Job = mongoose.model('Job', jobSchema);
module.exports = Job;