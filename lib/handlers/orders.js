/**
 * Orders Handlers
 */

var _data = require('../data');
var helpers = require('../helpers');
var httpStates = require('../httpStates');
var tokens = require('./tokens');

// Container for all orders methods
orders = {};

// Order - POST
// Required data:
// Optional data:
orders.post = function(data, callback) {
    // Get the token from the headers
    var token = typeof data.headers.token == 'string' ? data.headers.token : false;

    if (token) {
        // Lookup the user by reading the token
        _data.read('tokens', token, function(err, tokenData) {
            if (!err && tokenData) {
                var email = tokenData.email;

                tokens.verifyToken(token, email, function(isTokenValid) {
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

                                var amount = total * 100; // Convert for Stripe in cents
                                var currency = 'cad';
                                var description = 'Charge for ' + orderObj.email;
                                var source = 'tok_visa';

                                helpers.chargeOrder(amount, currency, description, source, function(err, data) {
                                    if (!err && data) {
                                        // Create the Stripe object with the response from the Stripe API
                                        var stripe = {
                                            id: data.id,
                                            object: data.charge,
                                            amount: data.amount,
                                            created: data.created,
                                            currency: data.currency,
                                            description: data.description,
                                            paid: data.paid,
                                            source: data.source,
                                            status: data.status
                                        };
                                        orderObj.stripe = stripe;

                                        // Send the email
                                        var today = new Date()
                                            .toISOString()
                                            .replace(/T.+/, '')
                                            .replace(/-/g, '/');

                                        var to = userData.fullName + ' <' + userData.email + '>';
                                        var from =
                                            'Mailgun Sandbox <postmaster@sandboxdcced64e59fe48499fba9bcc4e86dee0.mailgun.org>';
                                        var subject = 'Receipt for Purchase on ' + today;
                                        var text = 'Your total cost was $' + parseFloat(total);

                                        helpers.sendEmail(to, from, subject, text, function(err, data) {
                                            if (!err && data) {
                                                // Create the order
                                                _data.create('orders', orderId, orderObj, function(err) {
                                                    if (!err) {
                                                        // TODO: Delete the order from the user's cart
                                                        callback(httpStates.OK.statusCode);
                                                    } else {
                                                        callback(httpStates.CANT_CREATE_FILE.statusCode, {
                                                            Error: httpStates.CANT_CREATE_FILE.message + ': ' + err
                                                        });
                                                    }
                                                });
                                            } else {
                                                callback(err, data);
                                            }
                                        });
                                    } else {
                                        callback(err, data);
                                    }
                                });
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

module.exports = orders;
