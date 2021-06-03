const mongoose = require('mongoose');

const analyzedDataSchema = new mongoose.Schema({
    jobID: {
        type: mongoose.ObjectId,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    users: [mongoose.ObjectId]
}, {timestamps: true});

const AnalyzedData = mongoose.model('AnalyzedData', analyzedDataSchema);
module.exports = AnalyzedData;