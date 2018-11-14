/**
 * Request Handlers
 */

/**
 * TODOS:
 * - Remove error message from callbacks and add optional callback param for logging
 * - Add login with password and hash library
 */

// Dependencies
var httpStates = require('./httpStates');
var users = require('./handlers/users');
var tokens = require('./handlers/tokens');
var inventory = require('./handlers/inventory');
var cart = require('./handlers/cart');
var orders = require('./handlers/orders');

// Define the handlers
var handlers = {};

// Users handler
handlers.users = function(data, callback) {
    var acceptableMethods = ['post', 'get', 'put', 'delete'];

    if (acceptableMethods.indexOf(data.method) > -1) {
        users[data.method](data, callback);
    } else {
        callback(httpStates.METHOD_NOT_ALLOWED.status);
    }
};

// Tokens handler
handlers.tokens = function(data, callback) {
    var acceptableMethods = ['post', 'put', 'delete', 'get'];

    if (acceptableMethods.indexOf(data.method) > -1) {
        tokens[data.method](data, callback);
    } else {
        callback(httpStates.METHOD_NOT_ALLOWED.statusCode);
    }
};

// Inventory handler
handlers.inventory = function(data, callback) {
    var acceptableMethods = ['get'];

    if (acceptableMethods.indexOf(data.method) > -1) {
        inventory[data.method](data, callback);
    } else {
        callback(httpStates.METHOD_NOT_ALLOWED.status);
    }
};

// Cart handler
handlers.cart = function(data, callback) {
    var acceptableMethods = ['post'];

    if (acceptableMethods.indexOf(data.method) > -1) {
        cart[data.method](data, callback);
    } else {
        callback(httpStates.METHOD_NOT_ALLOWED.status);
    }
};

// Orders handler
handlers.orders = function(data, callback) {
    var acceptableMethods = ['post'];

    if (acceptableMethods.indexOf(data.method) > -1) {
        orders[data.method](data, callback);
    } else {
        callback(httpStates.METHOD_NOT_ALLOWED.status);
    }
};

// Ping handler
handlers.ping = function(data, callback) {
    var acceptableMethods = ['post', 'get'];

    if (acceptableMethods.indexOf(data.method) > -1) {
        handlers._ping[data.method](data, callback);
    } else {
        callback(httpStates.METHOD_NOT_ALLOWED.status);
    }
};

// Container for all the ping methods
handlers._ping = {};

handlers._ping.get = function(data, callback) {
    callback(httpStates.OK.statusCode, {
        message: httpStates.OK.message
    });
};

handlers._ping.post = function(data, callback) {
    callback(httpStates.OK.statusCode, {
        message: httpStates.OK.message
    });
};

handlers.notFound = function(data, callback) {
    callback(httpStates.NOT_FOUND.statusCode);
};

module.exports = handlers;
