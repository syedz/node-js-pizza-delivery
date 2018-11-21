/**
 * Request Handlers
 */

/**
 * TODOS:
 * - Remove error message from callbacks and add optional callback param for logging
 */

// Dependencies
var helpers = require('./helpers');
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
        callback(httpStates.METHOD_NOT_ALLOWED.statusCode);
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
        callback(httpStates.METHOD_NOT_ALLOWED.statusCode);
    }
};

// Cart handler
handlers.cart = function(data, callback) {
    var acceptableMethods = ['post'];

    if (acceptableMethods.indexOf(data.method) > -1) {
        cart[data.method](data, callback);
    } else {
        callback(httpStates.METHOD_NOT_ALLOWED.statusCode);
    }
};

// Orders handler
handlers.orders = function(data, callback) {
    var acceptableMethods = ['post'];

    if (acceptableMethods.indexOf(data.method) > -1) {
        orders[data.method](data, callback);
    } else {
        callback(httpStates.METHOD_NOT_ALLOWED.statusCode);
    }
};

// Ping handler
handlers.ping = function(data, callback) {
    var acceptableMethods = ['post', 'get'];

    if (acceptableMethods.indexOf(data.method) > -1) {
        handlers._ping[data.method](data, callback);
    } else {
        callback(httpStates.METHOD_NOT_ALLOWED.statusCode);
    }
};

// Index Handler
handlers.index = function(data, callback) {
    // Reject any request that isn't a GET
    if (data.method == 'get') {
        var templateData = {
            'head.title': 'Pizza Delivery Made Easy',
            'head.description': 'On demand pizza delivery',
            'body.class': 'index'
        };

        // Read in a template as a string
        helpers.getTemplate('index', templateData, function(err, str) {
            if (!err && str) {
                // Add the universal header and footer
                helpers.addUniversalTemplates(str, templateData, function(err, str) {
                    if (!err && str) {
                        // Return that page as HTML
                        callback(httpStates.OK.statusCode, str, 'html');
                    } else {
                        callback(httpStates.SOMETHING_WRONG.statusCode, undefined, 'html');
                    }
                });
            } else {
                callback(httpStates.SOMETHING_WRONG.statusCode, undefined, 'html');
            }
        });
    } else {
        callback(httpStates.METHOD_NOT_ALLOWED.statusCode, undefined, 'html');
    }
};

// Favicon
handlers.favicon = function(data, callback) {
    // Reject any request that isn't a GET
    if (data.method == 'get') {
        // Read in teh favicon's data
        helpers.getStaticAsset('favicon.ico', function(err, data) {
            if (!err && data) {
                // Callback the data
                callback(httpStates.OK.statusCode);
            } else {
                callback(httpStates.SOMETHING_WRONG.statusCode);
            }
        });
    } else {
        callback(httpStates.METHOD_NOT_ALLOWED.statusCode);
    }
};

// Public Assets Handler
handlers.public = function(data, callback) {
    // Reject any request that isn't a GET
    if (data.method == 'get') {
        // Get the filename being requested, and remove the 'public/' from it
        var trimmedAssetName = data.trimmedPath.replace('public/', '').trim();

        if (trimmedAssetName.length > 0) {
            // Read in the asset's data
            helpers.getStaticAsset(trimmedAssetName, function(err, data) {
                if (!err && data) {
                    // Determine the content type (and default to plain text)
                    var contentType = 'plain';

                    if (trimmedAssetName.indexOf('.css') > -1) {
                        contentType = 'css';
                    } else if (trimmedAssetName.indexOf('.png') > 1) {
                        contentType = 'png';
                    } else if (trimmedAssetName.indexOf('.jpg') > 1) {
                        contentType = 'jpg';
                    } else if (trimmedAssetName.indexOf('.ico') > 1) {
                        contentType = 'ico';
                    }

                    // Callback the data
                    callback(httpStates.OK.statusCode, data, contentType);
                } else {
                    callback(httpStates.NOT_FOUND.statusCode);
                }
            });
        } else {
            callback(httpStates.NOT_FOUND.statusCode);
        }
    } else {
        callback(httpStates.METHOD_NOT_ALLOWED.statusCode, undefined, 'html');
    }
};

handlers.accountCreate = function(data, callback) {
    // Reject any request that isn't a GET
    if (data.method == 'get') {
        // Prepare data for interpolation
        var templateData = {
            'head.title': 'Create an account',
            'head.description': 'Signup is easy and only take a few seconds',
            'body.class': 'accountCreate'
        };

        // Read in a template as a string
        helpers.getTemplate('accountCreate', templateData, function(err, str) {
            if (!err && str) {
                // Add the universal header and footer
                helpers.addUniversalTemplates(str, templateData, function(err, str) {
                    if (!err && str) {
                        // Return that page as HTML
                        callback(httpStates.OK.statusCode, str, 'html');
                    } else {
                        callback(httpStates.SOMETHING_WRONG.statusCode, undefined, 'html');
                    }
                });
            } else {
                callback(httpStates.SOMETHING_WRONG.statusCode, undefined, 'html');
            }
        });
    } else {
        callback(httpStates.METHOD_NOT_ALLOWED.statusCode, undefined, 'html');
    }
};

handlers.sessionCreate = function(data, callback) {
    // Reject any request that isn't a GET
    if (data.method == 'get') {
        // Prepare data for interpolation
        var templateData = {
            'head.title': 'Login to your account',
            'head.description': 'Enter yur account email and password',
            'body.class': 'sessionCreate'
        };

        // Read in a template as a string
        helpers.getTemplate('sessionCreate', templateData, function(err, str) {
            if (!err && str) {
                // Add the universal header and footer
                helpers.addUniversalTemplates(str, templateData, function(err, str) {
                    if (!err && str) {
                        // Return that page as HTML
                        callback(httpStates.OK.statusCode, str, 'html');
                    } else {
                        callback(httpStates.SOMETHING_WRONG.statusCode, undefined, 'html');
                    }
                });
            } else {
                callback(httpStates.SOMETHING_WRONG.statusCode, undefined, 'html');
            }
        });
    } else {
        callback(httpStates.METHOD_NOT_ALLOWED.statusCode, undefined, 'html');
    }
};

// Dashboard (view all inventory)
handlers.inventoryAll = function(data, callback) {
    // Reject any request that isn't a GET
    if (data.method == 'get') {
        // Prepare data for interpolation
        var templateData = {
            'head.title': 'Dashboard',
            'body.class': 'inventoryList'
        };

        // Read in a template as a string
        helpers.getTemplate('inventoryList', templateData, function(err, str) {
            if (!err && str) {
                // Add the universal header and footer
                helpers.addUniversalTemplates(str, templateData, function(err, str) {
                    if (!err && str) {
                        // Return that page as HTML
                        callback(200, str, 'html');
                    } else {
                        callback(500, undefined, 'html');
                    }
                });
            } else {
                callback(500, undefined, 'html');
            }
        });
    } else {
        callback(405, undefined, 'html');
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
