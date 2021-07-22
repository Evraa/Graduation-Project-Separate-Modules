const { body, validationResult, query, param } = require('express-validator');
const path = require('path');
const multer = require('multer');
const Application = require('../models/Application');
const Job = require('../models/Job');
const MessageBroker = require('../middleware/MessageBroker');
const fs = require('fs');
const User = require('../models/User');

const view = async (req, res) => {

    try {
        var application;
        if (req.user.role == "hr" || req.user.role == "admin") {
            application = await Application.findById(req.params.id, '+analyzedVideo +analyzedPersonality');
        } else if (req.user.role == "applicant") {
            application = await Application.findById(req.params.id);
            if (req.user.id != application.applicantID) {
                res.status(403).json({errors: [{"msg": "Unauthorized User"}]});
                return;
            }
        } else {
            res.status(403).json({errors: [{"msg": "Unauthorized User"}]});
            return;
        }
        if (application) {
            res.json(application);
        }
        else {
            res.status(404).json({errors: [{"msg": "Application is not found"}]});    
        }
    } catch(err) {
        console.log(err);
        res.status(404).json({errors: [{"msg": "Invalid application ID"}]});    
    }
};

const viewAnswers = async (req, res) => {
    try {
        const app = await Application.findById(req.params.id, 'answers');
        if (app) {
            text = '';
            for (const answer of app.answers) {
                text += answer.answer + ' ';
            }
            res.json({text});
        } else {
            res.status(404).json({errors: [{"msg": "Application is not found"}]});    
        }
    } catch (error) {
        res.status(404).json({errors: [{"msg": "Invalid application ID"}]});   
    }
};

const verifyJobID = () => {
    return param('jobID').isMongoId().withMessage("jobID should be a valid job ID").bail()
    .custom(async (val) => {
        const job = await Job.findById(val);
        if (job) {
            return true;
        }
        throw new Error("Job ID is not found");
    });

};

const verifyAnswers = () => {
    return body('answers').exists().withMessage("answers are required").bail()
        .isArray().withMessage("answers should be an array");
};

const checkForRequiredQuestions = (questions, answersMap) => {
    for (const q of questions) {
        if (q.required && !answersMap.get(q.id))
            return q.id;
    }
    return undefined;
};

const saveQuestionAnswers = async (questions, newAnswers, user) => {
    const answersMap = new Map();
    if (!user.answers) {
        user.answers = [];
    }
    for (const ans of user.answers) {
        answersMap.set(ans.questionID, ans.answer);
    }
    
    for (const q of questions) {
        if (q.ID && newAnswers.has(q.id)) {
            answersMap.set(q.ID, newAnswers.get(q.id));
        }
    }
    user.answers = [];
    for (const ans of answersMap) {
        user.answers.push({questionID: ans[0], answer: ans[1]});
    }
    
    await user.updateOne({answers: user.answers});
};

// if application already exists, it updates it
const store = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
    {
        res.status(400).json({errors: errors.array()});
        return;
    }
    try {
        const job = await Job.findById(req.params.jobID);
        const questions = job.questions;
        const answers = req.body.answers;
        answersMap = new Map();
        for (const e of answers) {
            answersMap.set(e.questionID, e.answer);
        }

        qID = checkForRequiredQuestions(questions, answersMap);
        if (qID) {
            res.status(400).json({errors: [{
                param: "answers",
                msg: "question answer is required",
                questionID: qID
            }]});
            return;
        }
        saveQuestionAnswers(questions, answersMap, req.user)
        .catch(err => console.log(err));

        const data = {
            answers, 
            jobID: job.id,
            applicantID: req.user.id
        };

        const application = await Application.findOne({jobID: job.id, applicantID: req.user.id});
        if (application) {
            application.updateOne(data).then(updatedApp => {
                res.json({updated: data});
                MessageBroker.getInstance().then(mBroker => {
                    mBroker.send(Buffer.from(JSON.stringify({
                        type: 'answers', applicationID: application.id
                    })));
                }).catch(error => console.log(error));
            }).catch(error => {
                console.log(error);
            });
        }
        else {
            Application.create(data).then(application => {
                res.json({created: application});
                if (!req.user.applications) {
                    req.user.applications = [];
                }
                req.user.applications.push({ID: application.id, title: job.title});
                req.user.updateOne({applications: req.user.applications}, (err, res) => {
                    if (err) {
                        console.log(err);
                    }
                });
                MessageBroker.getInstance().then(mBroker => {
                    mBroker.send(Buffer.from(JSON.stringify({
                        type: 'answers', applicationID: application.id
                    })));
                }).catch(error => console.log(error));
            }).catch(error => {
                console.log(error);
            });
        }
    } catch (error) {
        console.log(error);
    }
};

const RESUME_FORMATS = ['.pdf', '.doc', '.docx', '.odt', '.rtf', '.txt'];
const RESUME_PATH = 'uploads/resumes';

const uploadResume = multer({
    limits:{fileSize: '5mb'},
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        if(!RESUME_FORMATS.includes(ext)) {
            cb(null, false);
            return;
        }
        cb(null, true);
    },
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            fs.mkdirSync(RESUME_PATH, {recursive: true});
            cb(null, RESUME_PATH);
        },
        filename: (req, file, cb) => {
            const ext = path.extname(file.originalname);
            cb(null, req.user.id + '_' + req.params.jobID + ext);
        }
    })
});

// if resume already exists, it updates it
const storeResume = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
    {
        res.status(400).json({errors: errors.array()});
        return;
    }
    const application = await Application.findOne({
        jobID: req.params.jobID,
        applicantID: req.user.id
    });
    if (!application) {
        res.status(404).json({errors: [{msg: "application is not found"}]});
        return;
    }
    if (!req.file) {
        res.status(404).json({errors: [{
            msg: "Resume is not uploaded or in wrong format. format should be one of " + RESUME_FORMATS
        }]});
        return;
    }
    const resume = {
        url: req.file.path,
        name: req.file.originalname,
        date: new Date()
    };
    application.updateOne({resume}).then(_ => {
        res.json({resume});
    }).catch(error => {
        res.status(400).json(error);
    });
};

const viewResume = (req, res) => {
    const p = path.join(RESUME_PATH, req.params.fileName);
    if (!fs.existsSync(p)) {
        res.status(404).json({errors: [{msg: "Resume is not found"}]});
        return;
    }
    const applicantID = req.params.fileName.split('_')[0];
    if (!(req.user.role == "hr" || req.user.role == "admin" ||
        (req.user.role == "applicant" && req.user.id == applicantID))) {
            res.status(403).json({errors: [{"msg": "Unauthorized User"}]});
            return;
    }
    res.download(p);
};

const destroyResume = (req, res) => {
    const p = path.join(RESUME_PATH, req.params.fileName);
    if (!fs.existsSync(p)) {
        res.status(404).json({errors: [{msg: "Resume is not found"}]});
        return;
    }
    const applicantID = req.params.fileName.split('_')[0];
    if (!(req.user.role == "applicant" && req.user.id == applicantID)) {
        res.status(403).json({errors: [{"msg": "Unauthorized User"}]});
        return;
    }
    fs.unlink(p, err => {
        if (err) {
            console.log(err);
        }
    });
    const jobID = req.params.fileName.split('_')[1].split('.')[0];
    Application.findOne({jobID, applicantID}).then(application => {
        if (application) {
            application.updateOne({$unset: {resume: 1}}).catch(err => {
                console.log(err);
                return;
            });
        } else {
            res.status(404).json({errors: [{msg: "Application is not found"}]});
        }
    })
    .catch(err => {
        console.log(err);
    });
    res.json({msg: "Resume is deleted successfully"});
};

const VIDEO_FORMATS = ['.mp4', '.mov', '.wmv', '.flv', '.avi', '.mkv', '.webm'];
const VIDEO_PATH = 'uploads/videos';

const uploadVideo = multer({
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        if(!VIDEO_FORMATS.includes(ext)) {
            cb(null, false);
            return;
        }
        cb(null, true);
    },
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            fs.mkdirSync(VIDEO_PATH, {recursive: true});
            cb(null, VIDEO_PATH);
        },
        filename: (req, file, cb) => {
            const ext = path.extname(file.originalname);
            cb(null, req.user.id + '_' + req.params.jobID + ext);
        }
    })
});

// if video already exists, it updates it
const storeVideo = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
    {
        res.status(400).json({errors: errors.array()});
        return;
    }
    const application = await Application.findOne({
        jobID: req.params.jobID,
        applicantID: req.user.id
    });
    if (!application) {
        res.status(404).json({errors: [{msg: "application is not found"}]});
        return;
    }
    if (!req.file) {
        res.status(404).json({errors: [{
            msg: "Video isn't uploaded or in wrong format. format should be one of " + VIDEO_FORMATS
        }]});
        return;
    }
    const video = {
        url: req.file.path,
        name: req.file.originalname,
        date: new Date()
    };
    application.updateOne({video}).then(_ => {
        return MessageBroker.getInstance();
    }).then(mBroker => {
        mBroker.send(Buffer.from(JSON.stringify({type:'video', url:video.url})));
        res.json({video});
    })
    .catch(error => {
        res.status(400).json(error);
    });
};

const viewVideo = (req, res) => {
    const p = path.join(VIDEO_PATH, req.params.fileName);
    if (!fs.existsSync(p)) {
        res.status(404).json({errors: [{msg: "Video is not found"}]});
        return;
    }
    const applicantID = req.params.fileName.split('_')[0];
    if (!(req.user.role == "hr" || req.user.role == "admin" ||
        (req.user.role == "applicant" && req.user.id == applicantID))) {
            res.status(403).json({errors: [{"msg": "Unauthorized User"}]});
            return;
    }
    res.download(p);
};

const destroyVideo = (req, res) => {
    const p = path.join(VIDEO_PATH, req.params.fileName);
    if (!fs.existsSync(p)) {
        res.status(404).json({errors: [{msg: "Video is not found"}]});
        return;
    }
    const applicantID = req.params.fileName.split('_')[0];
    if (!(req.user.role == "applicant" && req.user.id == applicantID)) {
        res.status(403).json({errors: [{"msg": "Unauthorized User"}]});
        return;
    }
    fs.unlink(p, err => {
        if (err) {
            console.log(err);
        }
    });
    const jobID = req.params.fileName.split('_')[1].split('.')[0];
    Application.findOne({jobID, applicantID}).then(application => {
        if (application) {
            application.updateOne({$unset: {video: 1}}).catch(err => {
                console.log(err);
                return;
            });
        } else {
            res.status(404).json({errors: [{msg: "Application is not found"}]});
        }
    })
    .catch(err => {
        console.log(err);
    });
    res.json({msg: "video is deleted successfully"});
};

const verifyAnalyzedVideo = () => {
    return [
        body('jobID').notEmpty().withMessage("jobID is required").bail()
        .isMongoId().withMessage("jobID should be a valid job ID").bail()
        .custom(async (val) => {
            const job = await Job.findById(val);
            if (job) {
                return true;
            }
            throw new Error("Job ID is not found");
        }), 
        body('applicantID').notEmpty().withMessage("applicationID is required").bail()
        .isMongoId().withMessage("applicantID should be a valid applicant ID").bail()
        .custom(async (val) => {
            const user = await User.findById(val);
            if (user) {
                return true;
            }
            throw new Error("User ID is not found");
        })
    ];
};

const storeAnalyzedVideo = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({errors: errors.array()});
        return;
    }
    const application = await Application.findOne({jobID: req.body.jobID, applicantID: req.body.applicantID});
    if (application) {
        application.updateOne({analyzedVideo: req.body.analyzedVideo}).then(updatedApp => {
            res.json({analyzedVideo: req.body.analyzedVideo});
        }).catch(error => {
            console.log(error);
        });
    } else {
        res.status(404).json({errors: [{"msg": "Application is not found"}]});    
    }
};

const verifyAnalyzedPersonality = () => {
    return [
        body('results').notEmpty().withMessage("results are required"),
        body('results.type').notEmpty().withMessage("Type is requried").bail()
        .isString().withMessage("Type should be a string"),
        body('results.personality').notEmpty().withMessage("Personality is required").bail()
        .isString().withMessage("personality should be a string")
    ];
};

const storeAnalyzedPersonality = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({errors: errors.array()});
        return;
    }
    try {
        const app = await Application.findById(req.params.id);
        if (app) {
            await app.updateOne({analyzedPersonality: req.body.results});
            res.json({analyzedPersonality: req.body.results});
        } else {
            res.status(404).json({errors: [{"msg": "Application is not found"}]});    
        }
    } catch (error) {
        res.status(404).json({errors: [{"msg": "Invalid application ID"}]});   
    }
};

module.exports = {
    view,
    viewAnswers,
    verifyJobID,
    verifyAnswers,
    store,
    uploadResume,
    storeResume,
    viewResume,
    destroyResume,
    uploadVideo,
    storeVideo,
    viewVideo,
    destroyVideo,
    verifyAnalyzedVideo,
    storeAnalyzedVideo,
    verifyAnalyzedPersonality,
    storeAnalyzedPersonality
};