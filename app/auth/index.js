/**
 * Created by catalinc on 10/3/2016.
 */
'use strict';

const passport = require('passport');
const config = require('../config');
const h = require('../helpers');
const logger = require('../logger');
const FacebookStrategy = require('passport-facebook').Strategy;
const TwitterStrategy = require('passport-twitter').Strategy;

module.exports = () => {

    passport.serializeUser((user, done) => {
        done(null, user.id);

    });

    passport.deserializeUser((id, done) => {
        h.findById(id)
            .then(user => done(null, user))
            .catch(error => logger.log('error', 'Error when deserialising user :' + error))

    });
//  let authProcessor = (tocken, tockenSecret, profile, done) => {  twitter user OAuth 1.0
    let authProcessor = (accessToken, refreshToken, profile, done) => {
        // find use in local db
        // if user found retrun user using done()
        // if not found create new user in db
        h.findOne(profile.id)
            .then(result => {
                if (result) {
                    done(null, result);

                } else {
                    // create new user
                    h.createNewUser(profile)
                        .then(newChatUser => done(null, newChatUser))
                        .catch(error => logger.log('error', 'error when creating new user: ' + error))

                }

            });

    };

    passport.use(new FacebookStrategy(config.fb, authProcessor));
    passport.use(new TwitterStrategy(config.twitter, authProcessor));
};

