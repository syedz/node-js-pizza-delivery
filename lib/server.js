/**
 * Server related tasks
 */

// Dependencies
var http = require('http');
var https = require('https');
var fs = require('fs');
var path = require('path');
var url = require('url');
var StringDecoder = require('string_decoder').StringDecoder;
var handlers = require('./handlers');
var helpers = require('./helpers');
var config = require('./config');

// Instantiate the server module object
var server = {};

// Instantiate the HTTP server
server.httpServer = http.createServer(function(req, res) {
    server.unifiedServer(req, res);
});

// Instantiate the HTTPS server
server.httpsServerOptions = {
    key: fs.readFileSync(path.join(__dirname, '/../https/key.pem')),
    cert: fs.readFileSync(path.join(__dirname, '/../https/cert.pem'))
};

server.httpsServer = https.createServer(server.httpsServerOptions, function(req, res) {
    server.unifiedServer(req, res);
});

// Instantiate the HTTP server
server.unifiedServer = function(req, res) {
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
            typeof server.router[trimmedPath] !== 'undefined' ? server.router[trimmedPath] : handlers.notFound;

        // If the request is within the public directory, use the public handler instead
        chosenHandler = trimmedPath.indexOf('public/') > -1 ? handlers.public : chosenHandler;

        // Construct the data object to send to the handler
        var data = {
            trimmedPath: trimmedPath,
            queryStringObject: queryStringObject,
            method: method,
            headers: headers,
            payload: helpers.parseJsonToObject(buffer)
        };

        // Route the request to the hanlder specified in the router
        chosenHandler(data, function(statusCode, payload, contentType) {
            // Determine the type of response (fallback to JSON)
            contentType = typeof contentType == 'string' ? contentType : 'json';

            // Use the status code called back by the handler, or default to 200
            statusCode = typeof statusCode === 'number' ? statusCode : 200;

            // Convert the payload to a string
            var payloadString = JSON.stringify(payload);

            // Return the response parts that are content-specific
            var payloadString = '';

            if (contentType == 'json') {
                res.setHeader('Content-Type', 'application/json');
                // Use the payload called back by the handler, or default to an empty object
                payload = typeof payload === 'object' ? payload : {};
                payloadString = JSON.stringify(payload);
            } else if (contentType == 'html') {
                res.setHeader('Content-Type', 'text/html');
                payloadString = typeof payload == 'string' ? payload : '';
            } else if (contentType == 'favicon') {
                res.setHeader('Content-Type', 'image/x-icon');
                payloadString = typeof payload !== 'undefined' ? payload : '';
            } else if (contentType == 'css') {
                res.setHeader('Content-Type', 'text/css');
                payloadString = typeof payload !== 'undefined' ? payload : '';
            } else if (contentType == 'png') {
                res.setHeader('Content-Type', 'image/png');
                payloadString = typeof payload !== 'undefined' ? payload : '';
            } else if (contentType == 'jpg') {
                res.setHeader('Content-Type', 'image/jpg');
                payloadString = typeof payload !== 'undefined' ? payload : '';
            } else if (contentType == 'plain') {
                res.setHeader('Content-Type', 'text/plain');
                payloadString = typeof payload !== 'undefined' ? payload : '';
            }

            // Return the response
            res.writeHeader(statusCode);
            res.end(payloadString);

            // If the response is 200, print green otherwise print red
            if (statusCode === 200) {
                console.log('\x1b[32m%s\x1b[0m', method.toUpperCase() + ' /' + trimmedPath + ' ' + statusCode);
            } else {
                console.log('\x1b[31m%s\x1b[0m', method.toUpperCase() + ' /' + trimmedPath + ' ' + statusCode);
            }
        });
    });
};

server.init = function() {
    // Start the HTTP server
    server.httpServer.listen(config.httpPort, function() {
        console.log('\x1b[36m%s\x1b[0m', 'The server is listening on port ' + config.httpPort);
    });

    // Start the HTTPS server
    server.httpsServer.listen(config.httpsPort, function() {
        console.log('\x1b[35m%s\x1b[0m', 'The server is listening on port ' + config.httpsPort);
    });
};

server.router = {
    // Client Routes
    '': handlers.index,
    favicon: handlers.favicon,
    public: handlers.public,
    'account/create': handlers.accountCreate,
    'inventory/all': handlers.inventoryAll,
    cart: handlers.cartList,
    'session/create': handlers.sessionCreate,

    ping: handlers.ping,

    // API Routes
    'api/users': handlers.users,
    'api/tokens': handlers.tokens,
    'api/inventory': handlers.inventory,
    'api/cart': handlers.cart,
    'api/orders': handlers.orders
};

// Export the module
module.exports = server;
