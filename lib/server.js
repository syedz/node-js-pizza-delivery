/**
 * Server related tasks
 */

// Dependencies
var http = require('http');
var url = require('url');
var StringDecoder = require('string_decoder').StringDecoder;
var handlers = require('./handlers');
var helpers = require('./helpers');
var config = require('./config');

// Instantiate the server module object
var server = {};

// Instantiate the HTTP server
server.httpServer = http.createServer(function(req, res) {
    // Get the URL and parse it
    var parsedUrl = url.parse(req.url, true);

    // Get the path
    var path = parsedUrl.pathname;
    var trimmedPath = path.replace(/^\/+|\/+$/g, '');

    // Get the query string as an object
    var queryStringObject = parsedUrl.query;

    // Get the HTTP method
    var method = req.method.toLowerCase();

    // Get the headers as an object
    var headers = req.headers;

    // Get the payload, if any
    var decoder = new StringDecoder('utf-8');
    var buffer = '';

    req.on('data', function(data) {
        // Data event will NOT always be called
        buffer += decoder.write(data);
    });

    req.on('end', function() {
        // End event will always get called
        buffer += decoder.end();

        // Choose the handler this request should go to. If one is not found use not found handlers
        var chosenHandler =
            typeof server.router[trimmedPath] !== 'undefined'
                ? server.router[trimmedPath]
                : handlers.notFound;

        // Construct the data object to send to the handler
        var data = {
            trimmedPath: trimmedPath,
            queryStringObject: queryStringObject,
            method: method,
            headers: headers,
            payload: helpers.parseJsonToObject(buffer)
        };

        // Route the request to the hanlder specified in the router
        chosenHandler(data, function(statusCode, payload) {
            // Use the status code called back by the handler, or default to 200
            statusCode = typeof statusCode === 'number' ? statusCode : 200;

            // Use the payload called back by the handler, or default to an empty object
            payload = typeof payload === 'object' ? payload : {};

            // Convert the payload to string
            var payloadString = JSON.stringify(payload);

            // Return the response
            res.setHeader('Content-Type', 'application/json');
            res.writeHeader(statusCode);
            res.end(payloadString);

            // If the response is 200, print green otherwise print red
            if (statusCode === 200) {
                console.log(
                    '\x1b[32m%s\x1b[0m',
                    method.toUpperCase() + ' /' + trimmedPath + ' ' + statusCode
                );
            } else {
                console.log(
                    '\x1b[31m%s\x1b[0m',
                    method.toUpperCase() + ' /' + trimmedPath + ' ' + statusCode
                );
            }
        });
    });
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

server.router = {
    ping: handlers.ping,
    users: handlers.users,
    tokens: handlers.tokens,
    inventory: handlers.inventory,
    cart: handlers.cart
};

// Export the module
module.exports = server;
