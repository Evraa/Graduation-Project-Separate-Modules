const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const lo = require('lodash');

const User = require('../models/User');

const createToken = (id) => {
    return jwt.sign({id}, process.env.SECRET, {expiresIn: '1d'});
};

const verifySignup = () => {
    return [
        body('email').notEmpty().withMessage('Email is required').bail()
        .isEmail().withMessage("Email is not valid").normalizeEmail().bail()
        .custom(async (val) => {
            const user = await User.findOne({email: val});
            if (user) {
                throw new Error("Email already in use");
            }
            return true;
        }),

        body('password').notEmpty().withMessage("Password is required").bail()
        .isString().withMessage("Password should be a string").bail()
        .isLength({min: 8}).withMessage("Password should have minimum length of 8"),

        body('passwordConfirmation').notEmpty().withMessage("Password Confirmation is required").bail()
        .custom((val, {req}) =>{
            if (val !== req.body.password) {
                throw new Error("Password confirmation doesn't match");
            }
            return true;
        }),

        body('name').notEmpty().withMessage("Name is required").bail()
        .isAlpha().withMessage("Name should contain only letters"),

        
    ];
};

const signup = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
    {
        res.status(400).json({errors: errors.array()});
        return;
    }
    const data = lo.pick(req.body, ['email', 'password', 'name']);
    User.create(data).then(user => {
        const token = createToken(user.id);
        res.json({id: user.id, token});
    }).catch(error => {
        res.status(400).json(error);
    });
};

const me = (req, res) => {
    req.user.__v = undefined;
    res.json({user: req.user});
};

const verifyLogin = () => {
    return [
        body('email').notEmpty().withMessage('Email is required').bail()
        .isEmail().withMessage("Email is not valid").normalizeEmail().bail()
        .custom(async (val) => {
            const user = await User.findOne({email: val});
            if (user) {
                return true;
            }
            throw new Error("Email is not found");
        }),

        body('password').notEmpty().withMessage("Password is required")

    ];
};

const login = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({errors: errors.array()});
        return;
    }
    try {
        const user = await User.findOne({email: req.body.email}, {email:1, password:1});
        if (await user.isValidPassword(req.body.password)) {
            const token = createToken(user.id);
            res.json({id: user.id, token});
        } else {
            const passwordError = {
                "value": req.body.password,
                "msg": "Incorrect Password",
                "param": "password",
                "location": "body"
            };
            res.status(400).json({errors: [passwordError]});
        }

    } catch (error) {
        res.status(400).json({errors: [error.message]});
    }
};

const verifyUpdate = () => {
    return [
        body('oldPassword').if(body('newPassword').exists())
        .notEmpty().withMessage("You should enter the old password").bail()
        .custom(async (val, {req}) => {
            const user = await User.findById(req.user.id, '+password');
            req.user = user;
            if (!(await user.isValidPassword(val))) {
                throw new Error("The old password is incorrect");
            }
            return true;
        }),

        body('newPassword').optional().isString().withMessage("Password should be a string").bail()
        .isLength({min: 8}).withMessage("Password should have minimum length of 8").bail()
        .custom( (val, {req}) => {
            if (val === req.body.oldPassword) {
                throw new Error("The new password cannot be the same as the old password");
            }
            return true;
        }),

        body('passwordConfirmation').if(body('newPassword').exists())
        .notEmpty().withMessage("Password confirmation is required").bail()
        .custom((val, {req}) => {
            if (val !== req.body.newPassword) {
                throw new Error("The new password confirmation doesn't match");
            }
            return true;
        }),

        body('name').optional().isAlpha().withMessage("First name should constain only letters")
    ];
};

const update = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({errors: errors.array()});
        return;
    }
    data = lo.pick(req.body, ['name']);
    if (req.body.newPassword) {
        data.password = req.body.newPassword;
    }

    req.user.updateOne(data, (err, result) => {
        if (err) {
            console.log(err);
        }
        res.json({updated: data, id: req.user.id});
    });
};

module.exports = {
    verifySignup,
    signup,
    me,
    verifyLogin,
    login,
    verifyUpdate,
    update
};