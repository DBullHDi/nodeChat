/**
 * Created by catalinc on 9/21/2016.
 */


'use strict';

const config = require('../config');
const logger = require('../logger');
const Mongoose = require('mongoose').connect(config.dbURI);//can be changed co a local db from development json

//log error if connection fails
Mongoose.connection.on('error', error => {
    logger.log('error', 'Mongoose connection error: ' + error);
});

// Create a schema tat defines the structure for storing user data

const chatUser = new Mongoose.Schema({
    profileId: String,
    fullName: String,
    profilePic: String
});

// turn schema into model

let userModel = Mongoose.model('chatUser', chatUser);

// create a schema for rooms to be stored on database

const chatRoom = new Mongoose.Schema({
    room: String,
    roomID: String,
    users: Array
});

let roomModel = Mongoose.model('chatRoom', chatRoom);

module.exports = {
    Mongoose,
    userModel,
    roomModel
};