/**
 * Server related tasks
 */

// Dependencies
var http = require('http');
var config = require('./config');

// Instantiate the server module object
var server = {};

// Instantiate the HTTP server
server.httpServer = http.createServer(function(req, res) {
    console.log(req, res);
});

server.init = function() {
    // Start the HTTP server
    server.httpServer.listen(config.httpPort, function() {
        console.log(
            '\x1b[36m%s\x1b[0m',
            'The server is listening on port ' + config.httpPort
        );
    });
};

server.router = {};

// Export the module
module.exports = server;
