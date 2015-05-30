var fs = require('fs');
// HTTP module
var http = require('http');
var Drone = require('ar-drone'),
    //p5 = require('p5'),
    client = Drone.createClient();

var http = require('http');
var path = require('path');
var ext = require('extension');


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

io.sockets.on('connection',
    function (socket) {
        console.log("We have a new client: " + socket.id);
        socket.on('disconnect', function() {
            console.log("Client has disconnected");
        });
    }
);



function setup() {
    socket = io.connect('http://localhost');
    // We make a named event called 'mouse' and write an
    // anonymous callback function
    socket.on('mouse',
        function(data) {
            // Draw a blue circle
            fill(0,0,255);
            noStroke();
            ellipse(data.x,data.y,80,80);
        }
    );
}


//client.createRepl();