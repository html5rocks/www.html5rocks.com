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


//Require some modules.
var url = require("url");
var express = require('express');
var util = require('util');
var User = require('./User');
var roomManager = require('./RoomManager').getInstance();

var PORT_NUMBER = 8888;

//Create our web-server
var server = express.createServer();

//### Set-up our server ###
//Parses incoming file upload data.
//server.use(express.bodyParser({keepExtensions:true}));

//Tell the server where to look for static file requests
server.use(express.static(__dirname + '/static/', {bufferSize:1024}));
server.use(express.static(__dirname + '/shared/', {bufferSize:1024}));

//Runs though the get() or post() commands. (could be api calls, or custom file requests).
server.use(server.router);

//Start the server!
server.listen(PORT_NUMBER);

//Create the socket server.
var io = require('socket.io').listen(server);

//Configure a bunch of default options
io.configure(function() {
	//io.enable('browser client minification');//send minified client
	//io.enable('browser client gzip'); //Compress the client
	//io.enable('browser client etag'); //Enable client side caching
	io.set('log level', 1); //only log errors, default will display all logs.
	io.set('transports', [ //Transports fall though list (in this case only use HTML5 sockets).
		'websocket'
		//'flashsocket'
		//'htmlfile',
		//'xhr-polling',
		//'jsonp-polling'
		]);
	}
);

//Start listening for socket commands
io.sockets.on('connection', function (socket) {
  	//Create a new user and find a room for them.
	var u = User.create(socket);
	roomManager.assignRoom(u);
});

console.log('Connected on: ' + PORT_NUMBER);