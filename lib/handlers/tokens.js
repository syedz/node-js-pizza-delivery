/**
 * Token Handlers
 */

 // Dependencies
var httpStates = require('../httpStates');
var helpers = require('../helpers');
var _data = require('../data');

// Container all tokens methods
tokens = {};

// Tokens - POST
// Required data: email
// Optional data: none
tokens.post = function(data, callback) {
    var email = helpers.validateEmail(data.payload.email.trim()) ? data.payload.email.trim() : false;

    if (email) {
        // Lookup the user who matches that email
        _data.read('users', email, function(err, data) {
            if (!err && data) {
                if (email == data.email) {
                    // If valid, create a new token with a random name. Set expiration date to 1 hour in the future.
                    var tokenId = helpers.createRandomString(20);
                    var expires = Date.now() + 1000 * 60 * 60; // Right now + 1 sec * 60 sec * 60 min
                    var tokenObject = {
                        email: email,
                        id: tokenId,
                        expires: expires
                    };

                    // Store the token
                    _data.create('tokens', tokenId, tokenObject, function(err) {
                        if (!err) {
                            callback(httpStates.OK.statusCode, tokenObject);
                        } else {
                            callback(httpStates.CANT_CREATE_TOKEN.statusCode, {
                                Error: httpStates.CANT_CREATE_TOKEN.message
                            });
                        }
                    });
                }
            } else {
                callback(httpStates.CANT_FIND_USER.statusCode, {
                    Error: httpStates.CANT_FIND_USER.message
                });
            }
        });
    } else {
        callback(httpStates.BAD_REQUEST.statusCode, {
            Error: 'Missing required field(s)'
        });
    }
};

// Token - GET
// Required data: id
// Optional data: none
tokens.get = function(data, callback) {
    // Check that the id that they sent is valid
    var id =
        typeof data.queryStringObject.id == 'string' && data.queryStringObject.id.trim().length == 20
            ? data.queryStringObject.id.trim()
            : false;

    if (id) {
        // Lookup the token
        _data.read('tokens', id, function(err, tokenData) {
            if (!err && tokenData) {
                callback(httpStates.OK.statusCode, tokenData);
            } else {
                callback(httpStates.NOT_FOUND.statusCode);
            }
        });
    } else {
        callback(httpStates.BAD_REQUEST.statusCode, {
            Error: 'Missing required field'
        });
    }
};

// Tokens - PUT
// Required data: id, extend
// Optional data: none
tokens.put = function(data, callback) {
    var id = typeof data.payload.id == 'string' && data.payload.id.trim().length == 20 ? data.payload.id.trim() : false;

    var extend = typeof data.payload.extend == 'boolean' && data.payload.extend == true ? true : false;

    if (id && extend) {
        // Lookup the token
        _data.read('tokens', id, function(err, tokenData) {
            if (!err && tokenData) {
                // Check to make sure the token isn't already expired
                if (tokenData.expires > Date.now()) {
                    // Set the expiration to an hour from now
                    tokenData.expires = Date.now() + 1000 * 60 * 60;

                    // Store the new updated token
                    _data.update('tokens', id, tokenData, function(err) {
                        if (!err) {
                            callback(httpStates.OK.statusCode);
                        } else {
                            callback(httpStates.CANT_UPDATE_TOKEN.statusCode, {
                                Error: httpStates.CANT_UPDATE_TOKEN.message
                            });
                        }
                    });
                } else {
                    callback(httpStates.TOKEN_EXPIRED.statusCode, {
                        Error: httpStates.TOKEN_EXPIRED.message
                    });
                }
            } else {
                callback(httpStates.CANT_FIND_TOKEN.statusCode, {
                    Error: httpStates.CANT_FIND_TOKEN.message
                });
            }
        });
    } else {
        callback(httpStates.BAD_REQUEST.statusCode, {
            Error: 'Missing required field(s) or field(s) are invalid'
        });
    }
};

// Token - DELETE
// Required data: id
// Optional data: none
tokens.delete = function(data, callback) {
    var id =
        typeof data.queryStringObject.id == 'string' && data.queryStringObject.id.trim().length == 20
            ? data.queryStringObject.id.trim()
            : false;

    if (id) {
        // Lookup the user
        _data.read('tokens', id, function(err, data) {
            if (!err && data) {
                _data.delete('tokens', id, function(err) {
                    if (!err) {
                        callback(httpStates.OK.statusCode);
                    } else {
                        callback(httpStates.CANT_DELETE_TOKEN.statusCode, {
                            Error: httpStates.CANT_DELETE_TOKEN.message
                        });
                    }
                });
            } else {
                callback(httpStates.CANT_FIND_TOKEN.statusCode, {
                    Error: httpStates.CANT_FIND_TOKEN.message
                });
            }
        });
    } else {
        callback(httpStates.BAD_REQUEST.statusCode, {
            Error: 'Missing required fields'
        });
    }
};

// Verify if a given token id is currently valid for a given user
tokens.verifyToken = function(id, email, callback) {
    // Lookup the token
    _data.read('tokens', id, function(err, tokenData) {
        if (!err && tokenData) {
            // Check that the token is for the given user and has not expired
            if (tokenData.email == email && tokenData.expires > Date.now()) {
                callback(true);
            } else {
                callback(false);
            }
        } else {
            callback(false);
        }
    });
};

module.exports = tokens;