const { body, validationResult, query } = require('express-validator');
const lo = require('lodash');
const Job = require('../models/Job');

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
    Job.find({enabled: true}).skip(skip).limit(PAGE_SIZE)
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
    }).skip(skip).limit(PAGE_SIZE)
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
        console.log(err);
        res.status(500).json();
    });
};

const verifyStore = () => {
    return [
        body('title').notEmpty().withMessage("title is required").bail()
        .isString().withMessage("title should be a string"),

        body('description').notEmpty().withMessage("description is required").bail()
        .isString().withMessage("description should be a string"),

        body('questions').notEmpty().withMessage("questions is required").bail()
        .isArray().withMessage("questions should be an array"),
        
        body('videoRequired').notEmpty().withMessage("vedioRequired is required").bail()
        .isBoolean().withMessage("vedioRequired should be a boolean"),
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
    }).catch(error => {
        res.status(400).json(error);
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
        console.log(err);
        res.status(500).json();
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
        console.log(err);
        res.status(500).json();
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
        console.log(err);
        res.status(500).json();
    });
};

module.exports = {
    verifyIndex,
    index,
    verifySearch,
    search,
    view,
    verifyStore,
    store,
    enable,
    disable,
    verifyUpdate,
    update
};