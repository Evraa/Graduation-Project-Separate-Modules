const { body, validationResult, query, param } = require('express-validator');
const lo = require('lodash');
const Application = require('../models/Application');
const Job = require('../models/Job');
const User = require('../models/User');
const MessageBroker = require('../middleware/MessageBroker');

const verifyIndex = () => {
    return [
        query('page').optional().isInt().withMessage("page should be an integer")
        .custom(val => val > 0).withMessage("page should be greater than 0").default(1)
    ];
};

const index = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
    {
        res.status(400).json({errors: errors.array()});
        return;
    }
    const PAGE_SIZE = 10;
    const page = req.query.page;
    const skip = (page-1)*PAGE_SIZE;
    Job.find({enabled: true}).sort('-createdAt').skip(skip).limit(PAGE_SIZE)
    .then(jobs => {
        res.json(jobs);
    })
    .catch( err => {
        console.log(err);
        res.status(500).json();
    });
};

const verifySearch = () => {
    return [
        query('page').optional().isInt().withMessage("page should be an integer")
        .custom(val => val > 0).withMessage("page should be greater than 0").default(1),

        query('q').notEmpty().withMessage("search query is required").bail()
        .isString().withMessage("search query should be a string")
    ];
};

const search = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
    {
        res.status(400).json({errors: errors.array()});
        return;
    }
    const PAGE_SIZE = 10;
    const page = req.query.page;
    const skip = (page-1)*PAGE_SIZE;
    const query = req.query.q;
    Job.find({
        enabled: true,
        $or: [{title: RegExp(query, "i")}, {description: RegExp(query, "i")}],
    }).sort('-createdAt').skip(skip).limit(PAGE_SIZE)
    .then(jobs => {
        res.json(jobs);
    })
    .catch( err => {
        console.log(err);
        res.status(500).json();
    });
};

const view = (req, res) => {
    Job.findById(req.params.id)
    .then(job => {
        if (job) {
            res.json(job);
        }
        else {
            res.status(404).json({errors: [{"msg": "job is not found"}]});    
        }
    })
    .catch( err => {
        res.status(404).json({errors: [{"msg": "invalid job ID"}]});    
    });
};

const getAnswers = async (jobID, userID) => {
    const job = await Job.findById(jobID);
    const qSet = new Set();
    for (const q of job.questions) {
        if (q.ID) {
            qSet.add(q.ID.toString());
        }
    }
    const user = await User.findById(userID).select('answers');
    const answers = new Map();
    const allAnswers = user.answers;

    if (allAnswers) {
        for (const ans of allAnswers) {
            if (qSet.has(ans.questionID.toString())) {
                answers.set(ans.questionID, ans.answer);
            }
        }
    }
    return Object.fromEntries(answers);
};

const viewApplication = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
    {
        res.status(400).json({errors: errors.array()});
        return;
    }
    try {
        const application = await Application.findOne({jobID: req.params.id, applicantID: req.user.id});
        if (application ) {
            res.json({applied: true, application});
        } else {
            const answers = await getAnswers(req.params.id, req.user.id);
            res.json({applied: false, answers});
        }
    } catch (error) {
        console.log(error);
        res.status(500);
    }
};

const verifyJobID = () => {
    return param('id').isMongoId().withMessage("jobID should be a valid job ID").bail()
    .custom(async (val) => {
        const job = await Job.findById(val);
        if (job) {
            return true;
        }
        throw new Error("Job ID is not found");
    });
};

const getResumes = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({errors: errors.array()});
        return;
    }
    try {
        const resumes = await Application.find({
            jobID: req.params.id, resume: {$exists: true}
        }, "resume applicantID").exec();
        if (resumes && resumes.length) {
            res.json(resumes);
        } else {
            res.status(400).json({msg: "No resumes for this job"});
        }
    } catch (error) {
        console.error(error);
        res.status(500).send();
    }
};

const analyzeResumes = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({errors: errors.array()});
        return;
    }
    const job = await Job.findById(req.params.id);
    if (job) {
        const count = await Application.count({
            jobID: req.params.id, resume: {$exists: true}
        });
        if (count) {
            const mBroker = await MessageBroker.getInstance();
            mBroker.send(Buffer.from(JSON.stringify({
                type: "resumes",
                jobID: job._id,
                jobDescription: job.description
            })));
            res.json({msg: "Resumes is being processed"});
        } else  {
            res.status(400).json({msg: "No resumes for this job"});
        }
    } else {
        res.status(404).json({errors: [{"msg": "Job is not found"}]});
    }
};

const verifyRankedApplicants = () => {
    return [
        body('rankedApplicants').notEmpty().withMessage("rankedApplicants should be a non-empty array").bail()
        .isArray().withMessage("rankedApplicants should be an array").bail(),
        body('rankedApplicants.*.userID').isMongoId().withMessage("userID should be a valid user ID").bail()
        .custom(async (val) => {
            const user = await User.findById(val);
            if (user) {
                return true;
            }
            throw new Error("User ID is not found");
        }),
        body('rankedApplicants.*.scores').notEmpty().withMessage("scores is required").bail()
        .isArray().withMessage("scores should be an array"),
        body('rankedApplicants.*.scores.*').isNumeric().withMessage("scores should be numbers")
    ];
};

const storeRankedApplicants = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({errors: errors.array()});
        return;
    }
    try {
        const job = await Job.findById(req.params.id);
        if (job) {
            await job.updateOne({rankedApplicants: req.body.rankedApplicants});
            res.json({rankedApplicants: req.body.rankedApplicants});
        } else {
            res.status(404).json({errors: [{"msg": "Job is not found"}]});
        }
    } catch (error) {
        console.error(error);
        res.status(500).send();
    }
    
};

const getRankedApplicants = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({errors: errors.array()});
        return;
    }
    try {
        const job = await Job.findById(req.params.id, "rankedApplicants");
        const limit = 10;
        const page = req.query.page || 1;
        const skip = (page-1)*limit;
        if (job) {
            if ( job.rankedApplicants.length ) {
                const numOfPages = Math.ceil(job.rankedApplicants.length/limit);
                const users = job.rankedApplicants.slice(skip, skip+limit);
                const userData = [];
                const appData = [];
                for (const user of users) {
                    userData.push(User.findById(user.userID, 'email name picture'));
                    appData.push(Application.find({applicantID: user.userID, jobID: job.id}, '-jobID -applicantID +analyzedVideo +analyzedPersonality'));
                }
                // send response after all data are gathered
                Promise.allSettled([Promise.allSettled(userData), Promise.allSettled(appData)]).then(data => {
                    for (let i = 0; i < users.length; i++) {
                        users[i].data = data[0].value[i].value;
                        users[i].application = data[1].value[i].value;
                    }
                    res.json({users, page, numOfPages});
                }).catch(err => console.log(err));
            } else {
                res.status(404).json({errors: [{"msg": "No ranked applicants"}]});
            }
        } else {
            res.status(404).json({errors: [{"msg": "Job is not found"}]});
        }
    } catch (error) {
        console.log(error);
        res.status(500);
    }
};

const verifyStore = () => {
    return [
        body('title').notEmpty().withMessage("title is required").bail()
        .isString().withMessage("title should be a string"),

        body('description').notEmpty().withMessage("description is required").bail()
        .isString().withMessage("description should be a string"),

        body('questions').notEmpty().withMessage("questions are required").bail()
        .isArray().withMessage("questions should be an array"),
        
        body('videoRequired').notEmpty().withMessage("videoRequired is required").bail()
        .isBoolean().withMessage("videoRequired should be a boolean"),
    ];
};

const store = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
    {
        res.status(400).json({errors: errors.array()});
        return;
    }
    const data = lo.pick(req.body, ['title', 'description', 'questions', 'videoRequired']);
    Job.create(data).then(job => {
        res.json(job);
        if (!req.user.jobs) {
            req.user.jobs = [];
        }
        req.user.jobs.push({ID: job.id, title: job.title});
        return req.user.updateOne({jobs: req.user.jobs});
    }).catch(err => {
        res.status(400).json(err);
    });
};

const enable = (req, res) => {
    Job.findById(req.params.id)
    .then(job => {
        if (job) {
            job.updateOne({enabled: true}, (err, _result) => {
                if (err) {
                    console.log(err);
                    return;
                }
                res.json({"msg": "job is enabled"});
            });
        }
        else {
            res.status(404).json({errors: [{"msg": "job is not found"}]});    
        }
    })
    .catch( err => {
        res.status(404).json({errors: [{"msg": "invalid job ID"}]});
    });
};

const disable = (req, res) => {
    Job.findById(req.params.id)
    .then(job => {
        if (job) {
            job.updateOne({enabled: false}, (err, _result) => {
                if (err) {
                    console.log(err);
                    return;
                }
                res.json({"msg": "job is disabled"});
            });
        }
        else {
            res.status(404).json({errors: [{"msg": "job is not found"}]});    
        }
    })
    .catch( err => {
        res.status(404).json({errors: [{"msg": "invalid job ID"}]});
    });
};

const verifyUpdate = () => {
    return [
        body('title').optional().isString().withMessage("title should be a string"),

        body('description').optional().isString().withMessage("description should be a string"),

        body('questions').optional().isArray().withMessage("questions should be an array"),
        
        body('videoRequired').optional().isBoolean().withMessage("vedioRequired should be a boolean"),
    ];
};

const update  = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
    {
        res.status(400).json({errors: errors.array()});
        return;
    }
    Job.findById(req.params.id)
    .then(job => {
        if (job) {
            data = lo.pick(req.body, ['title', 'description', 'questions', 'videoRequired']);
            job.updateOne(data, (err, _result) => {
                if (err) {
                    console.log(err);
                    return;
                }
                res.json({updated: data});
            });
        }
        else {
            res.status(404).json({errors: [{"msg": "job is not found"}]});    
        }
    })
    .catch( err => {
        res.status(404).json({errors: [{"msg": "invalid job ID"}]});
    });
};

module.exports = {
    verifyIndex,
    index,
    verifySearch,
    search,
    view,
    viewApplication,
    verifyJobID,
    getResumes,
    analyzeResumes,
    verifyRankedApplicants,
    storeRankedApplicants,
    getRankedApplicants,
    verifyStore,
    store,
    enable,
    disable,
    verifyUpdate,
    update
};