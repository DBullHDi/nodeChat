/**
 * Created by catalinc on 9/28/2016.
 */

'use strict';
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const config = require('../config');
const db = require('../db');

if (process.env.NODE_ENV === 'production') {
    // production
    module.exports = session({
        secret: config.sessionSecret,
        resave: false,
        saveUninitialized: false,
        store: new MongoStore({
            mongooseConnection: db.Mongoose.connection
        })
    })
} else {
    // development
    module.exports = session({
        secret: config.sessionSecret,
        resave: false,
        saveUninitialized: true
    })
}

