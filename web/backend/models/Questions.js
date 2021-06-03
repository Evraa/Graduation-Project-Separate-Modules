const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    body: {
        type: String,
        required: true
    }
}, {timestamps: true});

const Question = mongoose.model('Question', questionSchema);
module.exports = Question;