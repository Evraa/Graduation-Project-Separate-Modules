const { body, validationResult, query, param } = require('express-validator');
const path = require('path');
const multer = require('multer');
const Application = require('../models/Application');
const Job = require('../models/Job');
const fs = require('fs');

const view = (req, res) => {
    Application.findById(req.params.id)
    .then(application => {
        if (application ) {
            if (!(req.user.role === "hr" || req.user.role === "admin" ||
             (req.user.role === "applicant" && req.user.id === application.applicantID))) {
                res.status(403).json({errors: [{"msg": "Unauthorized User"}]});
                return;
            }
            res.json(application);
        }
        else {
            res.status(404).json({errors: [{"msg": "Application is not found"}]});    
        }
    })
    .catch( err => {
        res.status(404).json({errors: [{"msg": "Invalid application ID"}]});    
    });
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

const checkForRequiredQuestions = (questions, answers) => {
    answersMap = new Map();
    for (const e of answers) {
        answersMap.set(e.questionID, e.answer);
    }
    for (const q of questions) {
        if (q.required && !answersMap.get(q.id))
            return q.id;
    }
    return undefined;
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
        
        qID = checkForRequiredQuestions(questions, answers);
        if (qID) {
            res.status(400).json({errors: [{
                param: "answers",
                msg: "question answer is required",
                questionID: qID
            }]});
            return;
        }
        
        const data = {
            answers, 
            jobID: job.id,
            applicantID: req.user.id
        };

        const application = await Application.findOne({jobID: job.id, applicantID: req.user.id});
        if (application) {
            application.updateOne(data).then(updatedApp => {
                res.json({updated: data});
            }).catch(error => {
                console.log(error);
            });
        }
        else {
            Application.create(data).then(application => {
                res.json({created: application});
                if (!job.applicationIDs) {
                    job.applicationIDs = [];
                }
                job.applicationIDs.push(application.id);
                job.updateOne({applicationIDs: job.applicationIDs}, (err, res) =>{
                    if (err) {
                        console.log(err);
                    }
                });
                if (!req.user.applications) {
                    req.user.applications = [];
                }
                req.user.applications.push(application.id);
                req.user.updateOne({applications: req.user.applications}, (err, res) => {
                    if (err) {
                        console.log(err);
                    }
                });
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
            application.updateOne({resume: {}}).catch(err => {
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

// if resume already exists, it updates it
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
        res.json({video});
    }).catch(error => {
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
            application.updateOne({video: {}}).catch(err => {
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

module.exports = {
    view,
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
    destroyVideo
};