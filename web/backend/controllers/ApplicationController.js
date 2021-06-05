const { body, validationResult, query, param } = require('express-validator');
const lo = require('lodash');
const multer = require('multer');
const upload = multer({dest: 'public/resumes'});
const Application = require('../models/Application');
const Job = require('../models/Job');

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

const verifyStore = () => {
    return [
        param('jobID').isMongoId().withMessage("jobID should be a valid job ID").bail()
        .custom(async (val) => {
            const job = await Job.findById(val);
            if (job) {
                return true;
            }
            throw new Error("Job ID is not found");
        }),

        body('answers').exists().withMessage("answers are required").bail()
        .isArray().withMessage("answers should be an array"),

    ];
};

const checkForRequiredQuestions = (questions, answers) => {
    answersMap = new Map();
    for (const e of answers) {
        answersMap.set(e.questionID, e.answer);
    }
    for (const q of questions) {
        if (q.required && !answersMap.get(q.id))
            return false;
    }
    return true;
};

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
        
        if (!checkForRequiredQuestions(questions, answers)) {
            res.status(400).json({errors: [{
                param: "answers",
                msg: "question answer is required",
                questionID: q.id
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
                res.status(400).json(error);
            });
        }
        else {
            Application.create(data).then(application => {
                res.json({created: application});
            }).catch(error => {
                res.status(400).json(error);
            });
        }
    } catch (error) {
        console.log(error);
    }
};


module.exports = {
    view,
    verifyStore,
    store,
    upload,
};