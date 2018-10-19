/**
 * Created by catalinc on 9/21/2016.
 */
'use strict';

// const router = require('express').Router();
const h = require('../helpers');
const passport = require('passport');
const config = require('../config');

module.exports = () => {
    let routes = {
        'get': {
            '/': (req, res, next)=> {
                // using res.render will look for the matching view file for express e.g. login.ejs
                res.render('login', {
                    pageTitle: 'this is da new titile'
                });

            },
            '/rooms': [h.isAuthenticated, (req, res, next)=> {
                res.render('rooms', {
                    user: req.user,
                    host:config.host
                });
            }],
            '/chat/:id': [h.isAuthenticated, (req, res, next)=> {
                // find chatroom with the given id
                let getRoom = h.findRoomById(req.app.locals.chatrooms, req.params.id);
                if(getRoom === undefined){
                    // by passing next() the router goes to the next route
                    // if it does not exist it will give the 404 page
                    return next();
                }else{
                    res.render('chatroom', {
                        user: req.user,
                        host: config.host,
                        room:getRoom.room,
                        roomID: getRoom.roomID
                    });
                }

            }],
            '/auth/facebook': passport.authenticate('facebook'),
            '/auth/facebook/callback': passport.authenticate('facebook', {
                successRedirect: '/rooms',
                failureRedirect: '/'
            }),
            '/auth/twitter': passport.authenticate('twitter'),
            '/auth/twitter/callback': passport.authenticate('twitter', {
                successRedirect: '/rooms',
                failureRedirect: '/'
            }),
            '/logout': (req, res, next) => {
                req.logout();
                res.redirect('/');
            }
            // '/getsession': (req, res, next)=> {
            //     res.send('my session ', req.session.favColor);
            // },
            // '/setsession': (req, res, next)=> {
            //    req.session.favColor = 'red yo';
            //     res.send('session set');
            // }

        },
        'post': {},
        'NA': (req, res, next)=> {
            res.status(404).sendFile(process.cwd() + '/views/404.htm');
        }
    };

    return h.route(routes);
};