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
var proxy = require('./utils/Proxy');
var uuid = require('node-uuid');
var EventEmitter = require('events').EventEmitter;
var crypto = require('crypto');

require('./shared/CommandTypes');

var Room = function (type) { this.init(type); };
sys.inherits(Room, EventEmitter);

Room.prototype.__defineGetter__('publicData', function () {
	return this._data;
});

Room.prototype.__defineGetter__('type', function () { return this._data.type; });

Room.prototype.__defineGetter__('id', function () { return this._data.id; });
Room.prototype.__defineSetter__('id', function (value) {
	this._data.id = value;
});

Room.prototype.__defineGetter__('owner', function() { return this._owner; })
Room.prototype.__defineSetter__('owner', function(value) {
	this._owner = value;
});

Room.prototype.__defineGetter__('lastUpdateTime', function () { return this._lastUpdateTime; });
Room.prototype.__defineSetter__('lastUpdateTime', function (value) {
	this._lastUpdateTime = value;
});

Room.prototype.__defineGetter__('users', function () { return this._users; });
Room.prototype.__defineSetter__('users', function (value) {
	this._users = value;
});

Room.prototype.__defineGetter__('userCount', function () { return this._users.length; });

var p = Room.prototype;

p.init = function (type) {
	EventEmitter.call(this);

	this._data = {};

	//Create a UID for this room.
	this.id = uuid();
	var shasum = crypto.createHash('md5');
	shasum.update(this.id);
	this.id = shasum.digest('hex');

	this.users = [];
	this.startTime = [];
};

p.addUser = function (user) {
	user.on(CommandTypes.USER_CHANGE, proxy.create(this, this.handleUserChange));
	user.on(CommandTypes.SAVE, proxy.create(this, this.handleSave));

	user.on('disconnect', proxy.create(this, this.handleUserDisconnect));

	//Assign user a random color.
	user.color = 0xffffff*Math.random()|0;
	
	user.send(CommandTypes.JOIN, {user:user.publicData, data:this.serialize()});
	
	this.users.push(user);

	this.send(CommandTypes.USER_JOINED_ROOM, user.publicData);
};

p.randomSort = function () {
	return Math.random()<.5?1:-1;
};

p.handleUserChange = function (index, data, user) {
	this.send(CommandTypes.USER_CHANGE, {index:index, values:data, userId:user.id}, user);
};

//serialize all this rooms data.
p.serialize = function () {
	var packet = {users:[]};

	for (var n in this._data) {
		packet[n] = this._data[n];
	}
	
	var l = this.users.length;
	for (var i=0;i<l;i++) {
		packet.users.push(this.users[i].publicData);
	}
	
	return packet;
};

p.handleUserDisconnect = function (user, reason) {
	this.removeUser(user);
};

p.removeUser = function (user) {
	var l = this.users.length;
	for (var i=0;i<l;i++) {
		var u = this.users[i];
		if (u == user) {
			this.users.splice(i, 1);
			break;
		}
	}
	
	user.removeAllListeners(CommandTypes.USER_CHANGE);
	user.removeAllListeners('disconnect');

	//Tell the other users this person left
	this.send(CommandTypes.USER_LEFT_ROOM, user.id);
	
	//Notify the RoomManager
	this.emit(CommandTypes.USER_LEFT_ROOM, this, user);
	
	//And tell the client to disconnect.
	user.send('disconnect');
};

/**
 *
 * Sends a message to all the users in this room.
 *
 * @param command What command id this is
 * @param data What data are we sending?
 * @param user And who's he user (we won't get back to the user who sent the command)
 */
p.send = function(command, data, user) {
	var l = this.userCount;
	for (var i=0;i<l;i++) {
		var u = this.users[i];
		//Don't send data back to the user who sent it initially.
		if (user && u.id == user.id) { continue; }

		u.send(command, data);
	}
};

exports.create = function(type) {
	return new Room(type);
};
