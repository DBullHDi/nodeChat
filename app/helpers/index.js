/**
 * Created by catalinc on 9/21/2016.
 */

'use strict';

const router = require('express').Router();
const db = require('../db');
const crypto = require('crypto');

// iterate through routes and register them in express
let _registerRoutes = (routes, method) => {
    for (let key in routes) {
        if (typeof routes[key] === 'object' && routes[key] !== null && !(routes[key] instanceof Array)) {
            _registerRoutes(routes[key], key);
        } else {
            // register the routes
            if (method === 'get') {

                console.log('debug time');
                router.get(key, routes[key])
            } else if (method === 'post') {
                router.post(key.routes[key])
            } else {
                router.use(routes[key]);
            }
        }
    }


};

let route = routes => {
    _registerRoutes(routes);
    return router;
};

// Find a single user based on a key
let findOne = profileID => {
    console.log('went to findOne :', profileID);
    return db.userModel.findOne({
        'profileId': profileID
    })
};


//create new user

let createNewUser = profile => {
    return new Promise((resolve, reject)=> {
        let newChatUser = new db.userModel({
            profileId: profile.id,
            fullName: profile.displayName,
            profilePic: profile.photos[0].value || ""
        });

        newChatUser.save(error => {
            if (error) {
                console.log('create new user error');
                reject(error);
            } else {
                resolve(newChatUser);
            }
        })
    })
};

let findById = id => {
    return new Promise((resolve, reject)=> {
        db.userModel.findById(id, (error, user) => {
            if (error) {
                reject(error);
            } else {
                resolve(user);
            }
        })
    })
};

// middleware function for detecting if user is logged in

let isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.redirect('/');
    }

};


// find a chat room by name
let findRoomByName = (allrooms, room)=> {
    // findIndex es6 method
    console.log('searching for room ', room);
    let findRoom = allrooms.findIndex((element, index, array)=> {

        return (element.room === room);
    });
    console.log((findRoom > -1));
    return (findRoom > -1);
};

// function for generating room id

let randomHex = () => {
    return crypto.randomBytes(24).toString('hex');
};

let findRoomById = (allrooms, roomID)=> {
    return allrooms.find((element, index, array)=> {
        if (element.roomID === roomID) {
            console.log('this is ', roomID);
            return true;
        } else {
            return false;
        }
    })
};

let addUserToRoom = (allrooms, data, socket) => {
    // get the room object
    let getRoom = findRoomById(allrooms, data.roomID);
    if (getRoom !== undefined) {
        // get the active user's ID (objectID as used in session)
        let userID = socket.request.session.passport.user;
        // check to see if user is already in chatroom
        let checkUser = getRoom.users.findIndex((element, index, array) => {
            return (element.userID == userID);
        });
        // if user is already present in room, remove him
        if (checkUser > -1) {
            getRoom.users.splice(checkUser, 1);
        }

        // push user into the room's user array

        getRoom.users.push({
            socketID: socket.id,
            userID,
            user: data.user,
            userPic: data.userPic
        });

        // join room channel
        socket.join(data.roomID);

        //return the updated room object
        return getRoom;
    }
};

let removeUserFromRoom = (allrooms, socket)=> {
    for (let room of allrooms) {
        // find the user
        let findUser = room.users.findIndex((element, index, array) => {
            if (element.socketID === socket.id) {
                return true;
            } else {
                return false;
            }
            // return true or false if user exists
        });

        if (findUser > -1) {
            socket.leave(room.roomID);
            room.users.splice(findUser, 1);

            return room;
        }
    }
};
module.exports = {
    route,
    findOne,
    createNewUser,
    findById,
    isAuthenticated,
    findRoomByName,
    randomHex,
    findRoomById,
    addUserToRoom,
    removeUserFromRoom
};