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


//Represents a user in an Room
var proxy = require('./utils/Proxy');
var sys = require('util');
var uuid = require('node-uuid');
var EventEmitter = require('events').EventEmitter;
var CommandTypes = require('./shared/CommandTypes').CommandTypes;

var User = function (socket) {
	EventEmitter.call(this);
	this.init(socket);
};

sys.inherits(User, EventEmitter);

User.prototype.__defineGetter__('publicData', function () {
	return this._data;
});

User.prototype.__defineGetter__('id', function () { return this._data.id; });
User.prototype.__defineSetter__('id', function (value) {
	this._data.id = value;
});

User.prototype.__defineGetter__('color', function () { return this._data.color; });
User.prototype.__defineSetter__('color', function (value) {
	this._data.color = value;
});

User.prototype.__defineGetter__('joinTime', function () { return this._data.joinTime; });
User.prototype.__defineSetter__('joinTime', function (value) {
	this._data.joinTime = value;
});

User.prototype.__defineGetter__('socket', function () { return this._socket; });
User.prototype.__defineSetter__('socket', function (value) {
	this._socket = value;
});

User.prototype.__defineGetter__('values', function () { return this._data.values; });
User.prototype.__defineSetter__('values', function (value) {
	this._data.values = value;
});

var p = User.prototype;

p.init = function(socket) {

	//Expose all public values in a single object, accessible via getters / setters.
	//Then to serialize we just call user.publicData;
	this._data = {};

	//Primarily stores instrument data for a sequence of values.
	this.values = [];

	this.socket = socket;

	this.id = uuid();

	this.joinTime = new Date();

	//Socket events
	this.socket.on('disconnect', proxy.create(this, this.handleDisconnect));

	//Commands sent from the clients
	this.socket.on(CommandTypes.SET_VALUE, proxy.create(this, this.handleSetValue));
	this.socket.on(CommandTypes.JOIN_ROOM, proxy.create(this, this.handleUserJoinRoomRequest));
};

p.handleUserJoinRoomRequest = function(id, customSounds, name) {
	this.emit(CommandTypes.JOIN_ROOM, this, id, customSounds, name);
}

p.handleSetValue = function (index, data) {
	this.values.push({index:index, data:data});

	this.emit(CommandTypes.USER_CHANGE, index, data, this);
};

p.disconnect = function() {
	this.socket.disconnect();
}

p.send = function (type, data) {
	this.socket.emit(type, data);
};

p.handleDisconnect = function (values) {
	this.emit('disconnect', this, values);
};

p.error = function(type, message) {
	this.send(CommandTypes.ERROR, {message:message, type:type});
};

exports.create = function (socket) {
	return new User(socket);
};