const User = require('../models/User');


const authorizeAdmin = (req, res, next) => {
    if(req.user.role !== "admin"){
        res.status(403).json({errors: [{"msg": "Unauthorized User"}]});
        return;
    }
    next();
    return;
};

const authorizeHR= (req, res, next) => {

    if(req.user.role !== "hr") 
    {
        res.status(403).json({errors: [{"msg": "Unauthorized User"}]});
        return;
    }
    next();
    return;
};

const authorizeAdminOrHR= (req, res, next) => {

    if(req.user.role !== "hr" && req.user.role !== "admin") 
    {
        res.status(403).json({errors: [{"msg": "Unauthorized User"}]});
        return;
    }
    next();
    return;
};

module.exports = { 
    authorizeAdmin,
    authorizeHR,
    authorizeAdminOrHR
};