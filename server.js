/**
 * Created by catalinc on 8/24/2016.
 */

'use strict';

const express = require('express');
const app = express();
const nodeChat = require('./app');
const passport = require('passport');

// let helloMiddleware = (req, resj, next)=>{
//     req.hello = "Hello yo";
//     next();
// };
//
// // sets the middleware function to be used only on the dashboad view
// app.use('/dashboard',helloMiddleware);


app.set('port', process.env.PORT || 3000);

// this is how you make available static assets
app.use(express.static('public'));

// with view engine (built into node) you set what you want to use for your templating engine
app.set('view engine', 'ejs');

app.use(nodeChat.session);
app.use(passport.initialize());
app.use(passport.session());
app.use(require('morgan')('combined', {
    stream: {
        write: message => {
            // write to the logs
            nodeChat.logger.log('info', message)
        }
    }
}));// for logging reqests

app.use('/', nodeChat.router);

nodeChat.ioServer(app).listen(app.get('port'), () => {
    console.log('nodeChat on 3000 yolo', app.get('port'));
});