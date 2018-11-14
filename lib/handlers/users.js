/**
 * Users Handlers
 */

// Dependencies
var httpStates = require('../httpStates');
var helpers = require('../helpers');
var _data = require('../data');

var tokens = require('./tokens');

// Container for all users methods
var users = {};

// Users - POST
// Required data: fullName, email, streetAddress
// Optional data: none
users.post = function(data, callback) {
    var fullName =
        typeof data.payload.fullName === 'string' && data.payload.fullName.trim().length > 0
            ? data.payload.fullName.trim()
            : false;

    var email = helpers.validateEmail(data.payload.email.trim()) ? data.payload.email.trim() : false;

    var streetAddress = helpers.validateStreetAddress(data.payload.streetAddress.trim())
        ? data.payload.streetAddress.trim()
        : false;

    if (fullName && email && streetAddress) {
        _data.read('users', email, function(err, data) {
            if (err) {
                var userObject = {
                    email: email,
                    fullName: fullName,
                    streetAddress: streetAddress,
                    cart: []
                };

                // Store the user
                _data.create('users', email, userObject, function(err) {
                    if (!err) {
                        callback(httpStates.OK.statusCode);
                    } else {
                        callback(httpStates.CANT_CREATE_FILE.statusCode, {
                            Error: httpStates.CANT_CREATE_FILE.message + ': ' + err
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
            Error: 'Missing required fields, or fields are invalid'
        });
    }
};

// Users - PUT
// Required data: email
// Optional data: fullName, streetAddress
users.put = function(data, callback) {
    var fullName =
        typeof data.payload.fullName === 'string' && data.payload.fullName.trim().length > 0
            ? data.payload.fullName.trim()
            : false;

    var email = helpers.validateEmail(data.payload.email.trim()) ? data.payload.email.trim() : false;

    var streetAddress = helpers.validateStreetAddress(data.payload.streetAddress.trim())
        ? data.payload.streetAddress.trim()
        : false;

    if (fullName && email && streetAddress) {
        // Get the token from the headers
        var token = typeof data.headers.token == 'string' ? data.headers.token : false;

        tokens.verifyToken(token, email, function(tokenIsValid) {
            if (tokenIsValid) {
                // Lookup the user
                _data.read('users', email, function(err, userData) {
                    if (!err && userData) {
                        // Update the fields if necessary
                        if (fullName) {
                            userData.fullName = fullName;
                        }
                        if (streetAddress) {
                            userData.streetAddress = streetAddress;
                        }

                        // Store the new updates
                        _data.update('users', email, userData, function(err) {
                            if (!err) {
                                callback(httpStates.OK.statusCode);
                            } else {
                                callback(httpStates.CANT_EDIT_FILE.statusCode, {
                                    Error: httpStates.CANT_EDIT_FILE.message + ': ' + err
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
                callback(httpStates.FORBIDDEN.statusCode, {
                    Error: httpStates.FORBIDDEN.message
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
users.delete = function(data, callback) {
    var email = typeof data.queryStringObject.email.trim() === 'string' ? data.queryStringObject.email.trim() : false;

    if (email) {
        // Get the token from the headers
        var token = typeof data.headers.token == 'string' ? data.headers.token : false;

        tokens.verifyToken(token, email, function(tokenIsValid) {
            if (tokenIsValid) {
                // Lookup the user
                _data.read('users', email, function(err, data) {
                    if (!err && data) {
                        // Delete the user
                        _data.delete('users', email, function(err) {
                            if (!err) {
                                callback(httpStates.OK.statusCode);
                            } else {
                                callback(httpStates.CANT_DELETE_FILE.statusCode, {
                                    Error: httpStates.CANT_DELETE_FILE.message + ', Error: ' + err
                                });
                            }
                        });
                    } else {
                        callback(httpStates.BAD_REQUEST.statusCode, {
                            Error: httpStates.BAD_REQUEST.message
                        });
                    }
                });
            } else {
                callback(httpStates.FORBIDDEN.statusCode, {
                    Error: httpStates.FORBIDDEN.message
                });
            }
        });
    } else {
        callback(httpStates.BAD_REQUEST.statusCode, {
            Error: 'Missing required fields'
        });
    }
};

module.exports = users;
