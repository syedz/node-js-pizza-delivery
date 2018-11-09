/**
 * Request Handlers
 */

// TODO: Create status code file with error messages

// Dependencies
var config = require('./config');

// Define the handlers
var handlers = {};

// Ping handler
handlers.ping = function(data, callback) {
    var acceptableMethods = ['post', 'get'];

    if (acceptableMethods.indexOf(data.method) > -1) {
        handlers._ping[data.method](data, callback);
    } else {
        callback(405);
    }
};

// Container for all the ping methods
handlers._ping = {};

handlers._ping.get = function(data, callback) {
    callback(200, {
        methodUsed: 'GET'
    });
};

handlers._ping.post = function(data, callback) {
    callback(200, {
        methodUsed: 'POST'
    });
};

handlers.notFound = function(data, callback) {
    callback(404);
};

module.exports = handlers;
