/**
 * Helpers for various tasks
 */

var https = require('https');
var querystring = require('querystring');
var config = require('./config');

// Container for all helpers
var helpers = {};

// Parse a JSON string to an object in all cases, without throwing and exception
helpers.parseJsonToObject = function(str) {
    try {
        var obj = JSON.parse(str);
        return obj;
    } catch (error) {
        return {};
    }
};

// TODO: Finish writing
// Validate email address
helpers.validateEmail = function(email) {
    if (typeof email !== 'string') return false;

    return true;
};

// TODO: Finish writing
// Validate street address
helpers.validateStreetAddress = function(streetAddress) {
    if (typeof streetAddress !== 'string') return false;

    return true;
};

// Create a string of random alphanumeric characters, of a given length
helpers.createRandomString = function(strLength) {
    strLength = typeof strLength == 'number' && strLength > 0 ? strLength : false;
    if (strLength) {
        // Define all the possible characters that could go into a string
        var possibleCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789';

        // Start the final string
        var str = '';
        for (i = 1; i <= strLength; i++) {
            // Get a random character from the possibleCharacters string
            var randomCharacter = possibleCharacters.charAt(
                Math.floor(Math.random() * possibleCharacters.length)
            );
            // Append this character to the final string
            str += randomCharacter;
        }

        // Return the final string
        return str;
    } else {
        return false;
    }
};

// Charge customer via Stripe
helpers.chargeOrder = function(amount, currency, description, source, callback) {
    // Check required fields
    var _amount = typeof amount === 'number' && amount > 0 ? amount : false;
    var _currency = typeof currency === 'string' ? currency : false;
    var _description = typeof description === 'string' ? description : false;
    var _source = typeof source === 'string' ? source : false;

    if (_amount && _currency && _source) {
        var payload = {
            amount: _amount,
            currency: _currency,
            source: _source,
            description: _description
        };

        // Stringify the payload
        var stringPayload = querystring.stringify(payload);

        var options = {
            protocol: 'https:',
            hostname: 'api.stripe.com',
            path: '/v1/charges',
            method: 'POST',
            body: stringPayload,
            auth: config.stripeSk,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(stringPayload)
            }
        };

        // Instantiate the request object
        var req = https.request(options, function(res) {
            // Grab the status of the sent request
            var status = res.statusCode;

            // Callback successfully if the request went through
            var buffer = '';
            res.on('data', function(chunk) {
                buffer += chunk;
            });

            if (status === 200 || status === 201) {
                res.on('end', function() {
                    var response = JSON.parse(buffer);
                    callback(status, response);
                });
            } else {
                res.on('end', function() {
                    var response = JSON.parse(buffer);
                    callback(status, {
                        Error: {
                            message: response.error.message,
                            param: response.error.param
                        }
                    });
                });
            }
        });

        req.on('error', function(e) {
            callback(e);
        });

        // write data to request body
        req.write(stringPayload);
        req.end();
    } else {
        callback('Requred fields where missing or invalid');
    }
};

helpers.sendEmail = function(to, from, subject, text, callback) {
    // Check required fields
    var _to = typeof to === 'string' ? to : false;
    var _from = typeof from === 'string' ? from : false;
    var _subject = typeof subject === 'string' ? subject : false;
    var _text = typeof text === 'string' ? text : false;

    if (_to && _subject && _text) {
        var payload = {
            to: _to,
            from: _from,
            subject: _subject,
            text: _text
        };

        // Stringify the payload
        var stringPayload = querystring.stringify(payload);

        var options = {
            protocol: 'https:',
            hostname: 'api.mailgun.net',
            path: '/v3/sandboxdcced64e59fe48499fba9bcc4e86dee0.mailgun.org/',
            method: 'POST',
            auth: config.mailGunApiKey,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(stringPayload)
            }
        };

        // Instantiate the request object
        var req = https.request(options, function(res) {
            // Grab the status of the sent request
            var status = res.statusCode;
            // Callback successfully if the request went through
            if (status === 200 || status === 201) {
                var buffer = '';
                res.on('data', function(data) {
                    buffer += data;
                });

                res.on('end', function() {
                    callback(false, JSON.parse(buffer));
                });
            } else {
                callback('Status code returned was ' + status);
            }
        });

        req.on('error', function(e) {
            callback(e);
        });

        // write data to request body
        req.write(stringPayload);
        req.end();
    } else {
        callback('Requred fields where missing or invalid');
    }
};

// Export the module
module.exports = helpers;
