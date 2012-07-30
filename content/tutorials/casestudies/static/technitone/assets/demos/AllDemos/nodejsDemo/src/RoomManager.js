/*
* Copyright (c) 2012 gskinner.com inc.
* Authored by: Wes Gorgichuk
*
* Permission is hereby granted, free of charge, to any person
* obtaining a copy of this software and associated documentation
* files (the "Software"), to deal in the Software without
* restriction, including without limitation the rights to use,
* copy, modify, merge, publish, distribute, sublicense, and/or sell
* copies of the Software, and to permit persons to whom the
* Software is furnished to do so, subject to the following
* conditions:
*
* The above copyright notice and this permission notice shall be
* included in all copies or substantial portions of the Software.
*
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
* EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
* OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
* NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
* HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
* WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
* FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
* OTHER DEALINGS IN THE SOFTWARE.
*/


var sys = require('util');
var Room = require('./Room');
var proxy = require('./utils/Proxy');

var MAX_USERS = 5;

//List of all active rooms.
var rooms = [];

//Stores all random generated rooms
var roomHash = {};

//Look for users and the room they're currently in
var userHash = {};

var RoomManager = function() { };

var p = RoomManager.prototype;

p.addUserListeners = function (user) {
	this.removeUserListeners(user);
};

p.removeUserListeners = function(user) {
	user.removeAllListeners(CommandTypes.JOIN_ROOM);
};

/**
 * Assigns the user to a random room,
 * or creates a new room if all current ones are full.
 *
 * @param user
 */
p.assignRoom = function(user) {
	var activeRoom;

	//Sort so all rooms are listed with emptiest first.
	rooms.sort(this.sortRooms);
	
	var firstRoom = rooms[0];
	var minCount = firstRoom!=null?firstRoom.userCount:null;
	
	if (minCount != null && minCount != MAX_USERS) {
		var l = rooms.length;
		var emptyRooms = [];
		for (var i=0;i<l;i++) {
			var r = rooms[i];
			if (r.userCount < MAX_USERS) {
				emptyRooms.push(r);
			} else {
				break;
			}
		}
		
		//Pick a random room from the empty ones
		activeRoom = emptyRooms[emptyRooms.length*Math.random()|0];
	} else {
		activeRoom = this.createRoom();

		roomHash[activeRoom.id] = activeRoom;
		rooms.push(activeRoom);
	}

	this.addUserToRoom(user, activeRoom);
};

p.createRoom = function (type) {
	var room = Room.create(type);
	room.on(CommandTypes.USER_LEFT_ROOM, proxy.create(this, this.handleUserLeftRoom));
	return room;
};

p.addUserToRoom = function(user, room) {
	room.addUser(user);
	this.addUserListeners(user);

	userHash[user.id] = room;
};

p.handleUserLeftRoom = function(room, user) {
	delete userHash[user.id];
	
	this.removeUserListeners(user);

	if (room.userCount == 0) {
		this.handleRoomEmpty(room);
	}
};

/**
 * @param room The room to remove
 *
 */
p.handleRoomEmpty = function (room) {
	var wasRemoved = false;
	var l, i;

	if (roomHash[room.id]) {
		delete roomHash[room.id];
		l = rooms.length;
		for (i=0;i<l;i++) {
			if (rooms[i].id == room.id) {
				wasRemoved = true;
				rooms.splice(i, 1); break;
			}
		}
	}
	
	if (wasRemoved) {
		room.removeAllListeners(CommandTypes.USER_LEFT_ROOM);
	}
};

exports.findRoom = function(id) {
	return roomHash[id];
};

p.sortRooms = function(a, b) {
	if (a.userCount < b.userCount) {
		return -1;
	} else {
		return 1;
	}
};

var roomManager;

exports.getInstance = function () {
	if (roomManager == null) {
		roomManager = new RoomManager();
	}

	return roomManager;
}