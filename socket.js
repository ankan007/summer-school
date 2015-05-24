var express = require('express');
var app = express();
var http = require('http');
var server = http.createServer(app);
var io = require('socket.io').listen(server);

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/chatApp');

var Schema = mongoose.Schema;
var chatSchema = new Schema({
	name : String,
	messages : [{body: String, date: Date}],
	updatedOn : [{type:Date, default: Date.now()}]
});

var Chat = mongoose.model('Chat',chatSchema);

server.listen(8080);
var len = 0;
// routing
app.get('/', function (req, res) {
  res.sendfile('chat.html');
});
//console.log('asd');
var users=[];
var userModel = new Chat();
debugger;
io.sockets.on('connection',function(socket){
	console.log('user connected');
	socket.on('start',function(user){
		socket.username=user;
		io.sockets.emit('add',user+' got added');
		users[len]=user;


		userModel.name = user;
		userModel.save(function(err,user){
			if(err)
				console.log(err);
			console.log(user);

		});


		console.log(users);
		socket.emit('add','you are connected to chat');
		io.sockets.emit('updateuser',users);
		len++;
	}),
	socket.on('updatechat',function(message){
		console.log(message);
      io.sockets.emit('add',socket.username+":"+message);

      Chat.findOne({'name':socket.username},function(err,user){
      	if(err)
      		console.log(err);
      	else
      		console.log(user);
      	var msg = {};
      	msg['body'] = message;
      	msg['date'] = Date.now();
      	user.messages.push(msg);
      	user.save(function(err,updateUser){
      		if(err)
      			console.log(err);
      		else
      			console.log(updatedUser);
      	});

      });
	}),
	socket.on('disconnect',function(){
        delete users[socket.username];
		io.sockets.emit('left',socket.username+" left");
	})
});