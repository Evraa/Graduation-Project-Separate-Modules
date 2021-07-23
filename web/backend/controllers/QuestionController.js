const { body, validationResult, query } = require('express-validator');
const lo = require('lodash');
const Question = require('../models/Question');

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
    const PAGE_SIZE = 20;
    const page = req.query.page;
    const skip = (page-1)*PAGE_SIZE;
    Question.find().sort('-updatedAt').skip(skip).limit(PAGE_SIZE)
    .then(questions => {
        res.json(questions);
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
    const PAGE_SIZE = 20;
    const page = req.query.page;
    const skip = (page-1)*PAGE_SIZE;
    const query = req.query.q;
    Question.find({body: RegExp(query, "i")}).sort('-updatedAt').skip(skip).limit(PAGE_SIZE)
    .then(questions => {
        res.json(questions);
    })
    .catch( err => {
        console.log(err);
        res.status(500).json();
    });
};

const view = (req, res) => {
    Question.findById(req.params.id)
    .then(question => {
        if (question) {
            res.json(question);
        }
        else {
            res.status(404).json({errors: [{"msg": "Question is not found"}]});    
        }
    })
    .catch( err => {
        res.status(404).json({errors: [{"msg": "Invalid question ID"}]});    
    });
};

const verifyStore = () => {
    return [
        body('body').notEmpty().withMessage("body is required").bail()
        .isString().withMessage("body should be a string"),
    ];
};

const store = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
    {
        res.status(400).json({errors: errors.array()});
        return;
    }
    const data = lo.pick(req.body, ['body']);
    Question.create(data).then(question => {
        res.json(question);
    }).catch(error => {
        res.status(400).json(error);
    });
};

const destory = (req, res) => {
    Question.findByIdAndDelete(req.params.id)
    .then(question => {
        if (question) {
            res.json({deleted: question});
        }
        else {
            res.status(404).json({errors: [{"msg": "Question is not found"}]});    
        }
    })
    .catch( err => {
        res.status(404).json({errors: [{"msg": "Invalid question ID"}]});    
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
    destory
};