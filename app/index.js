'use strict';

// const router = require('express').Router();
// routes can be declared like this or we can create an object for all routers eg. app/routers/index.js
// router.get('/', (req, res, next) => {
//     // res.send('<h1> Hello Express! </h1>');
//
//     //using sendFile you send a static page. this method adds a content type header
//     // res.sendFile(__dirname +'/views/login.htm');
//
//     //res.render method is used for rendering with ejs
//     res.render('login', {
//         pageTitle: 'this is da new titile'
//     });
// });
// router.get('/info',(req, res, next)=>{
//     res.send('Test page');
// });


//social authentication
const config = require('./config');
const redis = require('redis').createClient;
const adapter = require('socket.io-redis');

require('./auth')();


// create an IO Server instance
let ioServer = app => {
    app.locals.chatrooms = [];
    const server = require('http').Server(app);
    const io = require('socket.io')(server);

    // set socket to only use webSockets
    io.set('transports', ['websocket']);

    let pubClient = redis(config.redis.port, config.redis.host, {
        auth_pass: config.redis.password
    });
    let subClient = redis(config.redis.port, config.redis.host, {
        return_buffers: true,
        auth_pass: config.redis.password
    });

    io.adapter(adapter({
        pubClient,
        subClient
    }));

    io.use((socket, next) => {
        require('./session')(socket.request, {}, next);
    });
    require('./socket')(io, app);
    return server;
};

module.exports = {
    router: require('./routes')(),
    session: require('./session'),
    ioServer,
    logger: require('./logger')
};