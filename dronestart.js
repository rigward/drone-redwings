var fs = require('fs');
// HTTP module
var http = require('http'),
    Drone = require('ar-drone'),
    arDroneConstants = require('ar-drone/lib/constants'),
    path = require('path'),
    ext = require('extension'),
    client = Drone.createClient(),
    MIN_HEIGHT = 0.7,
    MAX_HEIGHT = 3,
    GLOBAL_ALTITUDE = 0,
    BAR_HEIGHT = 400,
    READY_TO_FLY = false;

var socketClient = null;
var store = Array();
var COMMAND_TIMEOUT_VALUE = 200;
var DanceFlag = true;
var RunDanceCommand = function (data) {
    if (READY_TO_FLY){
        if (data.z > 0) {
            client.up(data.z);
        }
        else {
            client.down(Math.abs(data.z));
        }
    }
}
function ConfigureDrone(){
    client.createRepl();
    client.disableEmergency();
    client.ftrim();
    client.config('control:control_vz_max', '1000', function () {
        console.log('vertical speed is successfully set');
    });
    client.config('control:altitude_max', '2700', function () {
        console.log('max attitude is successfully set');
    });
}

function StartPerfomance(){
    client.takeoff();
    setTimeout(function(){
        READY_TO_FLY = true;
    }, 5000);
}

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

client.on('navdata', function (d) {
    if (d.demo) {
        if (d.demo.altitude) {
            console.log("ALT: " + d.demo.altitude);
            GLOBAL_ALTITUDE = d.demo.altitude;
        }
    }
});

var getAverage = function (elmt) {
    var sum = 0;
    for (var i = 0; i < elmt.length; i++) {
        sum += parseInt(elmt[i], 10); //don't forget to add the base
    }
    return Math.round(sum * 1000 / elmt.length) / 1000;
};
var getMax = function (elmt) {
    var m = 0;
    for (var i = 0; i < elmt.length; i++) {
        m = Math.max(parseInt(elmt[i], 10), m); //don't forget to add the base
    }
    return m;
}


function CalculateDirection(SoundPower) {
    //console.log(MAX_HEIGHT, MIN_HEIGHT, BAR_HEIGHT, SoundPower);
    var TargetAltitude = ((MAX_HEIGHT - MIN_HEIGHT) / BAR_HEIGHT) * SoundPower + MIN_HEIGHT,
        Difference = TargetAltitude - GLOBAL_ALTITUDE,
        NormalizedAttitude = 2 / MAX_HEIGHT;
    if (Difference < 0) {
        NormalizedAttitude *= -1;
    }
    console.log('Difference: ' + Difference + ', Speed: ' + NormalizedAttitude);
    return NormalizedAttitude;
}

io.sockets.on('connection',
    function (socket) {

        if (socketClient) {
            return;
        }
        //var CommandsDance = new CommandsDanceClass();

        socketClient = socket.id;

        ConfigureDrone();

        console.log("New drone controller: " + socket.id);

        socket.on('disconnect', function () {
            console.log("Drone controller die");
            client.stop();
            client.land();
            socketClient = false
        });

        socket.on('mouse', function (data) {
            store.push(data);
        });

        socket.on('voice', function (command) {
            switch (command) {
                case 'dance':
                    console.log('Client dance');

                    break;
                case 'land':
                    console.log('Client land');
                    client.land();
                    READY_TO_FLY = false;
                    break;
                case 'perfom':
                    StartPerfomance();
                    break;
                case 'stop':

                    console.log('Client stop');
                    client.stop();
                    break;
            }
        });

        setInterval(function (e) {
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
                    //x: CalculateDirection(getAverage(x)),
                    //y: CalculateDirection(getAverage(y)),
                    z: CalculateDirection(getMax(z))
                }
            })(current);

            if (DanceFlag) {
                console.log(data);
                RunDanceCommand(data);
            }

            //CommandsDance.push(data)

        }, COMMAND_TIMEOUT_VALUE);

    }
);

//client.createRepl();