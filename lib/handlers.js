/**
 * Request Handlers
 */

// TODO: Remove error message from callbacks and add optional callback param for logging

// Dependencies
var config = require('./config');
var httpStates = require('./httpStates');
var helpers = require('./helpers');
var _data = require('./data');

// Define the handlers
var handlers = {};

// Users handler
handlers.users = function(data, callback) {
    var acceptableMethods = ['post', 'get', 'put', 'delete'];

    if (acceptableMethods.indexOf(data.method) > -1) {
        handlers._users[data.method](data, callback);
    } else {
        callback(httpStates.METHOD_NOT_ALLOWED);
    }
};

// Container for all users methods
handlers._users = {};

// Users - POST
// Required data: fullName, email, streetAddress
// Optional data: none
handlers._users.post = function(data, callback) {
    var fullName =
        typeof data.payload.fullName === 'string' &&
        data.payload.fullName.trim().length > 0
            ? data.payload.fullName.trim()
            : false;

    var email = helpers.validateEmail(data.payload.email.trim())
        ? data.payload.email.trim()
        : false;

    var streetAddress = helpers.validateStreetAddress(
        data.payload.streetAddress.trim()
    )
        ? data.payload.streetAddress.trim()
        : false;

    if (fullName && email && streetAddress) {
        _data.read('users', email, function(err, data) {
            if (err) {
                var userObject = {
                    email: email,
                    fullName: fullName,
                    streetAddress: streetAddress
                };

                // Store the user
                _data.create('users', email, userObject, function(err) {
                    if (!err) {
                        callback(httpStates.OK.statusCode);
                    } else {
                        callback(httpStates.CANT_CREATE_FILE.statusCode, {
                            Error:
                                httpStates.CANT_CREATE_FILE.message + ': ' + err
                        });
                    }
                });
            } else {
                // User already exists
                callback(httpStates.BAD_REQUEST.statusCode, {
                    Error: httpStates.BAD_REQUEST.message + ': ' + err
                });
            }
        });
    } else {
        callback(httpStates.BAD_REQUEST.statusCode, {
            Error: 'Missing required fields'
        });
    }
};

// Users - PUT
// Required data: email
// Optional data: fullName, streetAddress
handlers._users.put = function(data, callback) {
    var fullName =
        typeof data.payload.fullName === 'string' &&
        data.payload.fullName.trim().length > 0
            ? data.payload.fullName.trim()
            : false;

    var email =
        typeof data.payload.email.trim() === 'string'
            ? data.payload.email.trim()
            : false;

    var streetAddress = helpers.validateStreetAddress(
        data.payload.streetAddress.trim()
    )
        ? data.payload.streetAddress.trim()
        : false;

    if ((fullName, email, streetAddress)) {
        _data.read('users', email, function(err, data) {
            if (!err && data) {
                // Update the fields if necessary
                if (fullName) {
                    data.fullName = fullName;
                }
                if (streetAddress) {
                    data.streetAddress = streetAddress;
                }

                // Store the new updates
                _data.update('users', email, data, function(err) {
                    if (!err) {
                        callback(httpStates.OK.statusCode);
                    } else {
                        callback(httpStates.CANT_EDIT_FILE.statusCode, {
                            Error:
                                httpStates.CANT_EDIT_FILE.message + ': ' + err
                        });
                    }
                });
            } else {
                callback(httpStates.BAD_REQUEST.statusCode, {
                    Error: httpStates.BAD_REQUEST.message + ': ' + err
                });
            }
        });
    } else {
        callback(httpStates.BAD_REQUEST.statusCode, {
            Error: 'Missing required fields'
        });
    }
};

// Users - DELETE
// Required data: email
// Optional data: none
handlers._users.delete = function(data, callback) {
    var email =
        typeof data.payload.email.trim() === 'string'
            ? data.payload.email.trim()
            : false;

    if (email) {
        _data.read('users', email, function(err, data) {
            if (!err && data) {
                // Delete the user
                _data.delete('users', email, function(err) {
                    if (!err) {
                        callback(httpStates.OK.statusCode);
                    } else {
                        callback(httpStates.CANT_DELETE_FILE.statusCode, {
                            Error:
                                httpStates.CANT_DELETE_FILE.message +
                                ', Error: ' +
                                err
                        });
                    }
                });
            } else {
                callback(httpStates.BAD_REQUEST.statusCode, {
                    Error: httpStates.BAD_REQUEST.message + ': ' + err
                });
            }
        });
    } else {
        callback(httpStates.BAD_REQUEST.statusCode, {
            Error: 'Missing required fields'
        });
    }
};

// Ping handler
handlers.ping = function(data, callback) {
    var acceptableMethods = ['post', 'get'];

    if (acceptableMethods.indexOf(data.method) > -1) {
        handlers._ping[data.method](data, callback);
    } else {
        callback(httpStates.METHOD_NOT_ALLOWED);
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
    callback(httpStates.NOT_FOUND);
};

module.exports = handlers;
