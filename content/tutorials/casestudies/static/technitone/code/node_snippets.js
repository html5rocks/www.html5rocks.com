//Tell  our Javascript file we want to use express.
var express = require('express');

//Create our web-server
var server = express.createServer();

//Tell express where to look for our static files.
server.use(express.static(__dirname + '/static/'));

//Start listening for incoming connections.
server.listen(PORT_NUMBER);


var io = require('socket.io').listen(server);
//Start listening for socket commands
io.sockets.on('connection', function (socket) {
	//User is connected, start listening for commands.
	socket.on('someEventFromClient', handleEvent);

});

<!-- Socket-io will serve it-self when requested from this url. -->
<script type="text/javascript" src="/socket.io/socket.io.js"></script>

 <!-- Create our socket and connect to the server -->
 var sock = io.connect('http://localhost:8888');
 sock.on("connect", handleConnect);
 
 function handleConnect() {
 	//Send a event to the server.
 	sock.emit('someEventFromClient', 'someData');
 }