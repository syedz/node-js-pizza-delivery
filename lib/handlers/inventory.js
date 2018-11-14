/**
 * Inventory Handlers
 */

var _data = require('../data');
var _inventory = require('../inventory');
var httpStates = require('../httpStates');
var tokens = require('./tokens');

// Container all tokens methods
inventory = {};

// Inventory - GET
// Required data: none
// Optional data: none
inventory.get = function(data, callback) {
    // Get the token from the headers
    var token = typeof data.headers.token == 'string' ? data.headers.token : false;

    if (token) {
        // Lookup the user by reading the token
        _data.read('tokens', token, function(err, tokenData) {
            if (!err && tokenData) {
                var email = tokenData.email;

                tokens.verifyToken(token, email, function(isTokenValid) {
                    if (isTokenValid) {
                        // Return inventory
                        callback(httpStates.OK.statusCode, _inventory);
                    } else {
                        callback(httpStates.FORBIDDEN.statusCode, {
                            Error: httpStates.FORBIDDEN.message
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
        callback(httpStates.FORBIDDEN.statusCode, {
            Error: httpStates.FORBIDDEN.message
        });
    }
};

module.exports = inventory;
