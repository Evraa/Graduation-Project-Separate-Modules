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
        type: [{
            body: String,
            required: {type: Boolean, default: false},
            ID: mongoose.ObjectId
        }],
        required: true
    },
    videoRequired: {
        type: Boolean,
        required: true,
        default: false
    },
    enabled: {
        type: Boolean,
        required: true,
        default: true,
        select: false
    },
    applicationIDs: [mongoose.ObjectId]|null,
    analyzedData: [mongoose.ObjectId]|null
}, {timestamps: true});

const Job = mongoose.model('Job', jobSchema);
module.exports = Job;