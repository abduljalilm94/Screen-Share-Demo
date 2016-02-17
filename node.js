var express = require('express'),
	app = express(),
	server = require('http').createServer(app),
	io = require('socket.io').listen(server),
	users = {};
	
server.listen(3001);

app.use(express.static('public'));
app.get('/', function(req, res){
	res.sendfile(__dirname + '/public/index.html');
});

io.sockets.on('connection', function(socket){
	
	socket.on('new user', function(data, callback){
		if (data in users){
			callback();
		} else{
			socket.nickname = data;
			users[socket.nickname] = socket;
			updateNicknames();
		}
	});
	
	socket.on('check user', function(data, callback) {
		if (data in users){
			callback();
		} else{
			callback("This user does not exist!");
		}
	});
	
	function updateNicknames(){
		io.sockets.emit('usernames', Object.keys(users));
	}

	socket.on('send message', function(data, callback){
		if(data.name in users){
			users[data.name].emit('new message', data);
			console.log('Message sent to ' + data.name);
		} else{
			callback();
		}
	});
	
	socket.on('disconnect', function(data){
		if(!socket.nickname) return;
		delete users[socket.nickname];
		updateNicknames();
	});
});