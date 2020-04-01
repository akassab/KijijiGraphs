// Author: Ayman Kassab 2020
// A Passport strategy for authenticating with a JSON Web Token.
// This module lets you authenticate endpoints using a JSON web token. It is intended to be used to secure RESTful
//  endpoints without sessions.
// Dependencies --------------------------------------------------
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
// Model
const User = require('../models/user');
// config
const config = require('../config/database');

module.exports = function(passport) {

    let opts = {};
    // There is different ways we can pass the token back and forth we are using the auth header.
    opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
    // config secret
    opts.secretOrKey = config.secret;
    console.log("about to is ");
    passport.use(new JwtStrategy(opts, (jwt_payload, done) => {
        User.getUserById(jwt_payload.data._id, (err, user) => {
            if (err) {
                return done(err, false);
            }

            if (user) {

                return done(null, user);
            } else {

                return done(null, false);
            }
        });
    }));
};



