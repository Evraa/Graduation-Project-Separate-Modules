const {Schema, model} = require('mongoose');

const analyzedDataSchema = new Schema({
    jobID: {
        type: Schema.Types.ObjectId,
        ref: "Job",
        required: true
    },
    type: {
        type: String,
        required: true
    },
    users: [{type: Schema.Types.ObjectId, ref:'User'}]
}, {timestamps: true});

const AnalyzedData = model('AnalyzedData', analyzedDataSchema);
module.exports = AnalyzedData;