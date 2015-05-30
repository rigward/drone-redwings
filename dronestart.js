var fs = require('fs');
// HTTP module
var http = require('http'),
    Drone = require('ar-drone'),
    path = require('path'),
    ext = require('extension'),
    client = Drone.createClient();


var socketClient = null;
var store = Array();
var COMMAND_TIMEOUT_VALUE = 50;
var droneLevel = 0;
var RunDanceCommand = function (data) {
    if (data.z) {
        if (droneLevel < 5) {
            client.up(1);
            client.up(1);
            client.up(1);
            droneLevel++;
        }
    }
    else {
        if (droneLevel > -5) {
            client.down(0.1);
            droneLevel--;
        } /*else {
            client.up(1);
            droneLevel++;
        }*/
    }
}

var CommandsDanceClass = function () {
    this.stack = [];
    this.intervalKey;

    this.push = function (data) {
        if (data.z) {
            this.stack.push(function () {
                client.up(1);
            })
        }
        else {
            this.stack.push(function () {
                client.down(1);
            })
        }

    }
    this.pop = function () {
        if (this.stack.length) {
            return this.stack.shift()
        } else {
            return null;
        }
    }
    this.clear = function () {
        if (this.intervalKey) {
            clearInterval(this.intervalKey);
        }
    }
    var that = this;
    this.intervalKey = setInterval(function () {

        var command = that.pop();
        if (typeof command == 'function') {
            command();
        } else {
            that.clear();
        }

    }, COMMAND_TIMEOUT_VALUE)
};

// This function handles an incoming "request"
// And sends back out a "response";


function handleRequest(req, res) {
    // What did we request?
    var pathname = req.url;

    // If blank let's ask for index.html
    if (pathname == '/') {
        pathname = '/index.html';
    }

    // Ok what's our file extension
    var ext = path.extname(pathname);

    // Map extension to file type
    var typeExt = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css'
    };

    // What is it?  Default to plain text
    var contentType = typeExt[ext] || 'text/plain';

    // Now read and write back the file with the appropriate content type
    fs.readFile(__dirname + pathname,
        function (err, data) {
            if (err) {
                res.writeHead(500);
                return res.end('Error loading ' + pathname);
            }
            // Dynamically setting content type
            res.writeHead(200, {'Content-Type': contentType});
            res.end(data);
        }
    );
}

// Create a server with the handleRequest callback
var server = http.createServer(handleRequest);
// Listen on port 8080
server.listen(8080);

console.log('Server started on port 8080');
var io = require('socket.io').listen(server);
//client.on('navdata', console.log);

var getAverage = function (elmt) {
    var sum = 0;
    for (var i = 0; i < elmt.length; i++) {
        sum += parseInt(elmt[i], 10); //don't forget to add the base
    }
    return Math.round(sum * 1000 / elmt.length) / 1000;
};


var pushDanceCommand = function (data) {

};

io.sockets.on('connection',
    function (socket) {

        if (socketClient) {
            return;
        }
        //var CommandsDance = new CommandsDanceClass();

        socketClient = socket.id;

        client.createRepl();
        client.disableEmergency();
        client.config('control:control_vz_max', '2000', function () {
            console.log('here');
        });
        client.config('control:altitude_max', '1700', function () {
            console.log('here');
        });

        client.takeoff();
        console.log("New drone controller: " + socket.id);

        socket.on('disconnect', function () {
            console.log("Drone controller die");
            client.stop();
            client.land();
            socketClient = false
        });

        socket.on('mouse', function (data) {
            store.push(data);
            //console.log(data.t, Math.round(data.f * 1000) / 1000, data.c, data.l, data.h);
        });

        socket.on('voice', function (command) {
            switch (command) {
                case 'dance':

                    break;
                case 'land':
                    console.log('Client land');
                    client.land();
                    break;
                case 'takeoff':
                    break;
                case 'stop':
                    console.log('Client stop');
                    //client.stop();
                    client.land();
                    break;
            }
        });
        var prevData = undefined;

        setInterval(function (e) {
            //if (!store.length) {
            //    return;
            //}
            var current = store;
            store = [];
            var data = (function (current) {
                var x = [], y = [], z = [];
                current.forEach(function (_) {
                    switch (_.t) {
                        case 0:
                            x.push(_.f);
                            break;
                        case 1:
                            y.push(_.f);
                            break;
                        case 2:
                            z.push(_.f);
                            break;
                        default :
                            break;
                    }
                });
                return {
                    x: getAverage(x) > 200,
                    y: getAverage(y) > 200,
                    z: getAverage(z) > 150
                }
            })(current);
            console.log(data);
            RunDanceCommand(data);
            //CommandsDance.push(data)

        }, COMMAND_TIMEOUT_VALUE);

    }
);

//client.createRepl();