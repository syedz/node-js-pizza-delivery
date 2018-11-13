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
var helpers = require('./helpers');
var _data = require('./data');
var inventory = require('./inventory');

// Define the handlers
var handlers = {};

// Users handler
handlers.users = function(data, callback) {
    var acceptableMethods = ['post', 'get', 'put', 'delete'];

    if (acceptableMethods.indexOf(data.method) > -1) {
        handlers._users[data.method](data, callback);
    } else {
        callback(httpStates.METHOD_NOT_ALLOWED.status);
    }
};

// Container for all users methods
handlers._users = {};

// Users - POST
// Required data: fullName, email, streetAddress
// Optional data: none
handlers._users.post = function(data, callback) {
    var fullName =
        typeof data.payload.fullName === 'string' && data.payload.fullName.trim().length > 0
            ? data.payload.fullName.trim()
            : false;

    var email = helpers.validateEmail(data.payload.email.trim())
        ? data.payload.email.trim()
        : false;

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
            Error: 'Missing required fields'
        });
    }
};

// Users - PUT
// Required data: email
// Optional data: fullName, streetAddress
handlers._users.put = function(data, callback) {
    var fullName =
        typeof data.payload.fullName === 'string' && data.payload.fullName.trim().length > 0
            ? data.payload.fullName.trim()
            : false;

    var email = typeof data.payload.email.trim() === 'string' ? data.payload.email.trim() : false;

    var streetAddress = helpers.validateStreetAddress(data.payload.streetAddress.trim())
        ? data.payload.streetAddress.trim()
        : false;

    if ((fullName, email, streetAddress)) {
        // Get the token from the headers
        var token = typeof data.headers.token == 'string' ? data.headers.token : false;

        handlers._tokens.verifyToken(token, email, function(tokenIsValid) {
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
handlers._users.delete = function(data, callback) {
    var email =
        typeof data.queryStringObject.email.trim() === 'string'
            ? data.queryStringObject.email.trim()
            : false;

    if (email) {
        // Get the token from the headers
        var token = typeof data.headers.token == 'string' ? data.headers.token : false;

        handlers._tokens.verifyToken(token, email, function(tokenIsValid) {
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

// Tokens handler
handlers.tokens = function(data, callback) {
    var acceptableMethods = ['post', 'put', 'delete', 'get'];

    if (acceptableMethods.indexOf(data.method) > -1) {
        handlers._tokens[data.method](data, callback);
    } else {
        callback(httpStates.METHOD_NOT_ALLOWED.statusCode);
    }
};

// Container all tokens methods
handlers._tokens = {};

// Tokens - POST
// Required data: email
// Optional data: none
handlers._tokens.post = function(data, callback) {
    var email = helpers.validateEmail(data.payload.email.trim())
        ? data.payload.email.trim()
        : false;

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
handlers._tokens.get = function(data, callback) {
    // Check that the id that they sent is valid
    var id =
        typeof data.queryStringObject.id == 'string' &&
        data.queryStringObject.id.trim().length == 20
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
handlers._tokens.put = function(data, callback) {
    var id =
        typeof data.payload.id == 'string' && data.payload.id.trim().length == 20
            ? data.payload.id.trim()
            : false;

    var extend =
        typeof data.payload.extend == 'boolean' && data.payload.extend == true ? true : false;

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
handlers._tokens.delete = function(data, callback) {
    var id =
        typeof data.queryStringObject.id == 'string' &&
        data.queryStringObject.id.trim().length == 20
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
handlers._tokens.verifyToken = function(id, email, callback) {
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

// Inventory handler
handlers.inventory = function(data, callback) {
    var acceptableMethods = ['get'];

    if (acceptableMethods.indexOf(data.method) > -1) {
        handlers._inventory[data.method](data, callback);
    } else {
        callback(httpStates.METHOD_NOT_ALLOWED.status);
    }
};

// Container all tokens methods
handlers._inventory = {};

// Inventory - GET
// Required data: none
// Optional data: none
handlers._inventory.get = function(data, callback) {
    // Get the token from the headers
    var token = typeof data.headers.token == 'string' ? data.headers.token : false;

    if (token) {
        // Lookup the user by reading the token
        _data.read('tokens', token, function(err, tokenData) {
            if (!err && tokenData) {
                var email = tokenData.email;

                handlers._tokens.verifyToken(token, email, function(isTokenValid) {
                    if (isTokenValid) {
                        // Return inventory
                        callback(httpStates.OK.statusCode, inventory);
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

// Cart handler
handlers.cart = function(data, callback) {
    var acceptableMethods = ['post'];

    if (acceptableMethods.indexOf(data.method) > -1) {
        handlers._cart[data.method](data, callback);
    } else {
        callback(httpStates.METHOD_NOT_ALLOWED.status);
    }
};

// Container all tokens methods
handlers._cart = {};

// Cart - POST
// Required data: inventoryId, quantity
// Optional data: none
handlers._cart.post = function(data, callback) {
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
                handlers._tokens.verifyToken(token, email, function(isTokenValid) {
                    if (isTokenValid) {
                        // Get user data
                        _data.read('users', email, function(err, userData) {
                            if (!err && userData) {
                                if (inventory[itemId]) {
                                    // Calculate the subtotal using the inventory
                                    var subtotal = inventory[itemId].price * quantity;

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

// Orders handler
handlers.orders = function(data, callback) {
    var acceptableMethods = ['post'];

    if (acceptableMethods.indexOf(data.method) > -1) {
        handlers._orders[data.method](data, callback);
    } else {
        callback(httpStates.METHOD_NOT_ALLOWED.status);
    }
};

// Container for all orders methods
handlers._orders = {};

// Order - POST
// Required data:
// Optional data:
handlers._orders.post = function(data, callback) {
    // Get the token from the headers
    var token = typeof data.headers.token == 'string' ? data.headers.token : false;

    if (token) {
        // Lookup the user by reading the token
        _data.read('tokens', token, function(err, tokenData) {
            if (!err && tokenData) {
                var email = tokenData.email;

                handlers._tokens.verifyToken(token, email, function(isTokenValid) {
                    if (isTokenValid) {
                        // Get user data
                        _data.read('users', email, function(err, userData) {
                            if (!err && userData) {
                                // Generate a random hash for the orderId
                                var orderId = helpers.createRandomString(10);

                                var total = userData.cart.reduce(function(accum, currentVal) {
                                    return accum + parseInt(currentVal.subtotal);
                                }, 0);

                                var quantity = userData.cart.reduce(function(accum, currentVal) {
                                    return accum + parseInt(currentVal.quantity);
                                }, 0);

                                // Create the order object
                                var orderObj = {
                                    id: orderId,
                                    email: userData.email,
                                    items: userData.cart,
                                    quantity: quantity,
                                    total: total
                                };

                                var amount = total;
                                var currency = 'usd';
                                var description = 'Apples';
                                var source = 'tok_visa';

                                helpers.chargeOrder(amount, currency, description, source, function(
                                    err
                                ) {
                                    callback(httpStates.OK.statusCode, {
                                        Error: err
                                    });
                                });

                                var to = 'Zeeshan Syed <zsyed89@gmail.com>';
                                var from =
                                    'Mailgun Sandbox <postmaster@sandboxdcced64e59fe48499fba9bcc4e86dee0.mailgun.org>';
                                var subject = 'Hello Zeeshan Syed';
                                var text =
                                    'Congratulations Zeeshan Syed, you just sent an email with Mailgun!  You are truly awesome!';

                                helpers.sendEmail(to, from, subject, text, function(err) {
                                    callback(httpStates.OK.statusCode, {
                                        Error: err
                                    });
                                });

                                // Create the order
                                // _data.create('orders', orderId, orderObj, function(err) {
                                //     if (!err) {
                                //         // TODO: Delete the order from the user's cart
                                //         callback(httpStates.OK.statusCode);
                                //     } else {
                                //         callback(httpStates.CANT_CREATE_FILE.statusCode, {
                                //             Error: httpStates.CANT_CREATE_FILE.message + ': ' + err
                                //         });
                                //     }
                                // });
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
