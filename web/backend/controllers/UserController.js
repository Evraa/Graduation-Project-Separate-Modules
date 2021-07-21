const { body, validationResult, query, param } = require('express-validator');
const jwt = require('jsonwebtoken');
const lo = require('lodash');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const Job = require('../models/Job');
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

const verifyIndex = () => {
    return [
        query('page').optional().isInt().withMessage("page should be an integer")
        .custom(val => val > 0).withMessage("page should be greater than 0").default(1)
    ];
};

// show HR users for admin
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
    User.find({role: 'hr'}).select("-applications -jobs").skip(skip).limit(PAGE_SIZE)
    .then(users => {
        res.json(users);
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

// admin can search for users
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
    User.find({
        $or: [{email: RegExp(query, "i")}, {name: RegExp(query, "i")}],
    }).select("-applications -jobs").skip(skip).limit(PAGE_SIZE)
    .then(users => {
        res.json(users);
    })
    .catch( err => {
        console.log(err);
        res.status(500).json();
    });
};

const view = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            if (req.user.role == "admin" || (req.user.role == "hr" && user.role == "applicant") ||
            req.user.id == user.id) {
                res.json({ user });
            } else {
                res.status(403).json({errors: [{"msg": "Unauthorized User"}]});
            }
        } else {
            res.status(404).json({errors: [{"msg": "User is not found"}]});
        }
        
    } catch (error) {
        console.error(err);
        res.status(400).json({errors: [{"msg": "Invalid user ID"}]});    
    }
};

const verifyUserID = () => {
    return param('id').isMongoId().withMessage("ID should be a valid user ID").bail()
    .custom(async (val) => {
        const job = await User.findById(val);
        if (job) {
            return true;
        }
        throw new Error("User ID is not found");
    });

};

const promote = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({errors: errors.array()});
        return;
    }
    const user = await User.findById(req.params.id);
    user.role = 'hr';
    await user.save();
    res.json({msg: "User is promoted to HR successfully"});
};

const demote = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({errors: errors.array()});
        return;
    }
    const user = await User.findById(req.params.id);
    user.role = 'applicant';
    await user.save();
    res.json({msg: "User is demoted to applicant successfully"});
};

const PICTURE_FORMATS = ['.png', '.jpg', '.jpeg', '.tif', '.tiff', '.bmb', '.gif'];
const PICTURE_PATH = 'public/pictures';

const uploadPicture = multer({
    limits:{fileSize: '5mb'},
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        if(!PICTURE_FORMATS.includes(ext)) {
            cb(null, false);
            return;
        }
        cb(null, true);
    },
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            fs.mkdirSync(PICTURE_PATH, {recursive: true});
            cb(null, PICTURE_PATH);
        },
        filename: (req, file, cb) => {
            const ext = path.extname(file.originalname);
            cb(null, req.user.id + ext);
        }
    })
});

// if picture already exists, it updates it
const storePicture = async (req, res) => {
    
    if (!req.file) {
        res.status(404).json({errors: [{
            msg: "Picture is not uploaded or in wrong format. format should be one of " + PICTURE_FORMATS
        }]});
        return;
    }
    const picture = req.file.path.substr(7);
        
    req.user.updateOne({picture}).then(_ => {
        res.json({picture});
    }).catch(error => {
        res.status(400).json(error);
    });
};

const destroyPicture = async (req, res) => {
    const p =  'public/' + req.user.picture;
    try {
        if (!req.user.picture || !fs.existsSync(p)) {
            res.status(404).json({errors: [{msg: "Picture is not found"}]});
            return;
        }
        fs.unlinkSync(p);
        await req.user.updateOne({picture: ""});
        res.json({msg: "Picture is deleted successfully"});
    } catch (error) {
        console.log(error);
        res.status(500).send();
    }
};

module.exports = {
    verifySignup,
    signup,
    me,
    verifyLogin,
    login,
    verifyUpdate,
    update,
    index,
    verifyIndex,
    search,
    verifySearch,
    verifyUserID,
    view,
    promote,
    demote,
    uploadPicture,
    storePicture,
    destroyPicture
};