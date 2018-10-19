/**
 * Created by catalinc on 10/6/2016.
 */

'use strict';

const h = require('../helpers');

module.exports = (io, app) => {
    let allrooms = app.locals.chatrooms;


    io.of('/roomslist').on('connection', socket => {
        // console.log('Socket.io connected to client');
        socket.on('getChatrooms', ()=> {
            socket.emit('chatRoomsList', JSON.stringify(allrooms));
        });

        socket.on('createNewRoom', newRoomInput => {
            // console.log(newRoomInput);
            // check if a room with the same name exist
            // if not create one and broadcast an event
            console.log('new room received: ',newRoomInput);
            if (!h.findRoomByName(allrooms, newRoomInput)) {
                allrooms.push({
                    room: newRoomInput,
                    roomID: h.randomHex(),
                    users: []
                });
                console.log('inserting new room');
                // emit updated list to the creator
                // the event is emitted only to the active socket
                socket.emit('chatRoomsList', JSON.stringify(allrooms));

                // broadcast.emit is used to send the event to all the users in the rooms page
                socket.broadcast.emit('chatRoomsList', JSON.stringify(allrooms));
            }
        })
    });

    io.of('/chatter').on('connection', socket => {
        // join a chatroom
        socket.on('join', data => {
            // console.log("here is your ",data);
            let userList = h.addUserToRoom(allrooms, data, socket);
            console.log("here is the list ",userList);

            // udate the list of active users
            socket.broadcast.to(data.roomID).emit('updateUsersList', JSON.stringify(userList.users));
            socket.emit('updateUsersList', JSON.stringify(userList.users));
        });

        // when a user disconnects
        socket.on('disconnect', ()=>{
            let room = h.removeUserFromRoom(allrooms, socket);
            socket.broadcast.to(room.roomID).emit('updateUsersList', JSON.stringify(room.users));
        });


        // when a message arrives


        socket.on('newMessage', data =>{
            socket.to(data.roomID).emit('inMessage', JSON.stringify(data));
        })
    })
};