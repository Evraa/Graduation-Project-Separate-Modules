const passport = require('passport');
const passportJWT = require("passport-jwt");
const JWTStrategy = passportJWT.Strategy;
const User = require('../models/User');


// const tokenExtractor = (req) => {
//     if (req) {
//         if (req.cookies && req.cookies.token)
//             return req.cookies.token;
//         if (req.headers && req.headers.authorization)
//             return req.headers.authorization.split(" ")[1];
//     }
//     return null;
// };

passport.use(new JWTStrategy({
    jwtFromRequest: passportJWT.ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.SECRET
},
    function (jwtPayload, done) {
        return User.findById(jwtPayload.id)
            .then(user => {
                return done(null, user);
            }
            ).catch(err => {
                return done(err);
            });
    }
));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) =>{
        done(err, user);
    });
});

const checkUser = (req, res, next) => { 
    passport.authenticate('jwt', {session: false}, (err, user, info) => {
        if (err) {
            console.log(err);
            return;
        }
        req.user = user;
        next();
    })(req, res, next);
};

const requireAuth = (req, res, next) => { 
    if (!req.user) {
        res.status(401).json({errors: [{"msg": "The JWT token is invalid"}]});
    } else {
        next();
    }
};

module.exports = {
    requireAuth,
    checkUser
};