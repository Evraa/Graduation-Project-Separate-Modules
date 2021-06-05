const {Schema, model} = require('mongoose');
const { isEmail } = require('validator');
const bcrypt = require("bcrypt");

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        validate: isEmail,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        minlength: 8,
        select: false
    },
    role: {
        type: String,
        required: true,
        default: 'applicant',
        lowercase: true,
        enum: ['admin', 'hr', 'applicant']
    },
    name: {
        type: String,
        required: true
    },
    picture: String,
    jobs: [{title: String, ID: {type: Schema.Types.ObjectId, ref: 'Job'}}]|null,
    applications: [{title: String, ID: {type: Schema.Types.ObjectId, ref: 'Application'}}]|null,
    // applicantsNum: Number,
    resume: String,
    answers: [{questionID: {type: Schema.Types.ObjectId, ref: 'Question'}, answer: String}]|null

}, {timestamps: true});

userSchema.pre('save', async function (next) {
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

userSchema.pre('updateOne', async function (next) {
    if (this._update && this._update.password)
    {
        const salt = await bcrypt.genSalt();
        this._update.password = await bcrypt.hash(this._update.password, salt);
    }
    next();
});

userSchema.methods.isValidPassword = function(password) {
    return bcrypt.compare(password, this.password);
};

const User = model('User', userSchema);
module.exports = User;