var app = angular.module("TestApp", ['ngRoute']);
app.config(function ($routeProvider) {
    $routeProvider
		.when('/home', {
			controller: 'ctrl',
			templateUrl: 'partials/home.html'
		}) 
		.when('/packages', {
			controller: 'ctrl',
			templateUrl: 'partials/packages.html'
		})
        .when('/information',
        {
            controller: 'ctrl',
            templateUrl: 'partials/information.html'
        })
        .when('/assistance', {
            controller: 'ctrl',
            templateUrl: 'partials/assistance.html'
        })
        .otherwise({redirectTo: '/home'});
});
app.controller("ctrl", function($scope, $location) {
    $scope.nextPage = function (path, send) {
        $location.path(path);
        if (send === true) sendEvent('nextPage', path);
    }
});

var socket = io.connect();
var users = '';
var username = '';
var recepient = '';

function setUsername(name) {
    username = name;
    socket.emit('new user', username, function () {
        console.log("There was an error adding the user!");
    });
}

function setRecepient(name) {
    socket.emit('check user', name, function (error) {
		if (error) {
			console.log(error);
			return;
		}
        recepient = name;
    });
}

function sendEvent(event, args) {
    if (username != '' && recepient != '') {
		var data = { event: event, args: args, name: recepient };
		console.log('Event called: ' + event + '\nRecepient: ' + recepient);
		socket.emit('send message', data, function () {
			console.log("Error! Message not sent");
		});
    } else{
		console.log("Set usernames to send events");
	}
}

jQuery(function ($) {
    socket.on('usernames', function (data) {
        users = data;
        console.log('Username: ' + username + '\nUsers: ' + users);
    });

    socket.on('new message', function (data) {
        console.log('Event received: ' + data.event + '\nArguments: ' + data.args + '\nRecepient: ' + data.name);
		var bodyCtrl = angular.element($('body')).scope();
        if (data.name == username) {
            if (data.event == 'nextPage') {
                bodyCtrl.nextPage(data.args, false);
                bodyCtrl.$apply();
            }
        }
    });
});