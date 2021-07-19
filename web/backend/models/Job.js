const {Schema, model} = require('mongoose');

const jobSchema = new Schema({
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
            ID: {type: Schema.Types.ObjectId, ref: "Question"}
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
    rankedApplicants: {
        type:[{
            id: {type: Schema.Types.ObjectId, ref: "User"},
            scores: [Number],
            data: Schema.Types.Mixed,
            application: Schema.Types.Mixed
        }],
        select: false
    }
}, {timestamps: true});

const Job = model('Job', jobSchema);
module.exports = Job;