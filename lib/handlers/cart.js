/**
 * Cart Handlers
 */

var _data = require('../data');
var _inventory = require('../inventory');
var httpStates = require('../httpStates');
var tokens = require('./tokens');

// Container all tokens methods
cart = {};

// Cart - POST
// Required data: inventoryId, quantity
// Optional data: none
cart.post = function(data, callback) {
    var itemId = typeof data.payload.itemId == 'string' ? data.payload.itemId : 0;
    var quantity = typeof data.payload.quantity == 'number' ? data.payload.quantity : 0;

    if (itemId && quantity) {
        // Get the token from the headers
        var token = typeof data.headers.token == 'string' ? data.headers.token : false;

        // Lookup the user by reading the token
        _data.read('tokens', token, function(err, tokenData) {
            if (!err && tokenData) {
                // Get email from token
                var email = tokenData.email;

                // Verify the token belongs to the user
                tokens.verifyToken(token, email, function(isTokenValid) {
                    if (isTokenValid) {
                        // Get user data
                        _data.read('users', email, function(err, userData) {
                            if (!err && userData) {
                                if (_inventory[itemId]) {
                                    // Calculate the subtotal using the inventory
                                    var subtotal = _inventory[itemId].price * quantity;

                                    // If the item already exists then just increment the quantity
                                    var itemExistsInCart = false;
                                    userData.cart.forEach(function(item) {
                                        if (item.itemId === itemId) {
                                            item.quantity += quantity;
                                            item.subtotal += subtotal;
                                            itemExistsInCart = true;
                                        }
                                    });

                                    if (!itemExistsInCart) {
                                        // Create cart object
                                        var cartObject = {
                                            itemId: itemId,
                                            quantity: quantity,
                                            subtotal: subtotal
                                        };

                                        userData.cart.push(cartObject);
                                    }
                                    _data.update('users', email, userData, function(err) {
                                        if (!err) {
                                            callback(httpStates.OK.statusCode);
                                        } else {
                                            callback(httpStates.CANT_EDIT_FILE.statusCode, {
                                                Error: httpStates.CANT_EDIT_FILE.message
                                            });
                                        }
                                    });
                                } else {
                                    callback(httpStates.CANT_FIND_INVENTORY_ITEM.statusCode, {
                                        Error: httpStates.CANT_FIND_INVENTORY_ITEM.message
                                    });
                                }
                            } else {
                                callback(httpStates.CANT_FIND_USER.statusCode, {
                                    Error: httpStates.CANT_FIND_USER.message
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

module.exports = cart;
