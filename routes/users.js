// Author: Ayman Kassab 2020
// All of our user's routes

// Dependencies ---------------------------------------
// Bring in express
const express = require('express');
// Bring in passport
const passport = require('passport');
// Bring is JWT module
const jwt = require('jsonwebtoken');
// Bring in config
const config = require('../config/database')
// Bring in router
const router = express.Router();
// Bring in User model
const User = require('../models/user');

// Register route:
router.post('/register', (req,res,next) => {
    let newUser = new User({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        username: req.body.username

    });
    console.log(newUser);

    User.addUser(newUser, (err, user) => {
        if (err) {
            res.json({success: false, msg:"Failed to register user."});
        } else {
            res.json({success: true, msg:"User registered."});
        }
    })
});

// Authentication route:
router.post('/authenticate', (req,res,next) => {
    const username = req.body.username;
    const password = req.body.password;

    User.getUserByUsername(username, (err,user) => {
        if (err) throw err;
        if (!user) {
            return res.json({success: false, msg: 'User not found.'});
        }
        User.comparePassword(password,user.password, (err,isMatch) => {
            if (err) throw err;
            if (isMatch) {
                const token = jwt.sign({data: user}, config.secret, {
                    expiresIn: 604800
                });
                console.log("here !" + username + " " + password);
                // client side in angular 2, store this token of this user inside cookies or local storage
                // when needed to make a request to protected route use this token in the header
                res.json({
                    success: true,
                    token: 'Bearer ' + token,
                    user: {
                        id: user._id,
                        name: user.name,
                        username: user.username,
                        email: user.email
                    }
                });
            }
            else {
                return res.json({success: false, msg: 'Wrong password'});
            }
        });
    });
});

// Profile route to be protected with authentication (token):
router.get('/profile', passport.authenticate('jwt',{session : false}),(req,res) => {
    res.send({user: req.user});
});


module.exports = router;