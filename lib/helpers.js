/**
 * Helpers for various tasks
 */

var crypto = require('crypto');
var fs = require('fs');
var https = require('https');
var path = require('path');
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

// Validate email address
helpers.validateEmail = function(email) {
    if (typeof email !== 'string') return false;

    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email.trim()).toLowerCase());
};

// Validate password
helpers.validatePassword = function(password) {
    if (typeof password !== 'string') return false;

    return String(password.trim()).length >= 8;
};

// Validate street address
helpers.validateStreetAddress = function(streetAddress) {
    if (typeof streetAddress !== 'string') return false;

    var re = /^\d+\s[A-z]+\s[A-z]+/;
    return re.test(String(streetAddress.trim()).toLowerCase());
};

// Create a SHA256 hash
helpers.hash = function(str) {
    if (typeof str == 'string' && str.length > 0) {
        var hash = crypto
            .createHmac('sha256', config.hashingSecret)
            .update(str)
            .digest('hex');

        return hash;
    } else {
        return false;
    }
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
            var randomCharacter = possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length));
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
                    callback(false, response);
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
            path: '/v3/sandboxdcced64e59fe48499fba9bcc4e86dee0.mailgun.org/messages',
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
            var buffer = '';
            res.on('data', function(chunk) {
                buffer += chunk;
            });

            if (status === 200 || status === 201) {
                res.on('end', function() {
                    var response = JSON.parse(buffer);
                    callback(false, response);
                });
            } else {
                res.on('end', function() {
                    var response = JSON.parse(buffer);
                    callback(status, {
                        Error: {
                            message: response.message
                        }
                    });
                });
            }
        });

        req.on('error', function(e) {
            callback(e);
        });

        // Write data to request body
        req.write(stringPayload);
        req.end();
    } else {
        callback('Requred fields where missing or invalid');
    }
};

// Get the string content of a template
helpers.getTemplate = function(templateName, data, callback) {
    templateName = typeof templateName == 'string' && templateName.length > 0 ? templateName : false;
    data = typeof data == 'object' && data != null ? data : {};

    if (templateName) {
        var templateDir = path.join(__dirname, '/../templates/');
        fs.readFile(templateDir + templateName + '.html', 'utf8', function(err, str) {
            if (!err && str && str.length > 0) {
                // Do interpoloation on the string
                var finalString = helpers.interpolate(str, data);
                callback(false, finalString);
            } else {
                callback('No template could not be found');
            }
        });
    } else {
        callback('A valid template name was not specified');
    }
};

// Add the univeral header and footer to a string, and pass the provided data object to the header and footer for interpoloation
helpers.addUniversalTemplates = function(str, data, callback) {
    str = typeof str == 'string' && str.length > 0 ? str : '';
    data = typeof data == 'object' && data !== null ? data : {};

    // Get the header
    helpers.getTemplate('_header', data, function(err, headerString) {
        if (!err && headerString) {
            // Get the footer
            helpers.getTemplate('_footer', data, function(err, footerString) {
                if (!err && footerString) {
                    // Add them all together
                    var fullString = headerString + str + footerString;
                    callback(false, fullString);
                } else {
                    callback('Could not find the footer template');
                }
            });
        } else {
            callback('Could not find the header template');
        }
    });
};

// Take a given string and a data object and find/replace all the keys within it
helpers.interpolate = function(str, data) {
    str = typeof str == 'string' && str.length > 0 ? str : '';
    data = typeof data == 'object' && data !== null ? data : {};

    // Add the templateGlobals to the data object, prepending their key name with "global"
    for (var keyName in config.templateGlobals) {
        if (config.templateGlobals.hasOwnProperty(keyName)) {
            data['global.' + keyName] = config.templateGlobals[keyName];
        }
    }

    // For each key in the data object, insert its value into the string at the corresponding placeholder
    for (var key in data) {
        if (data.hasOwnProperty(key) && typeof data[key] == 'string') {
            var replace = data[key];
            var find = '{' + key + '}';
            str = str.replace(find, replace);
        }
    }

    return str;
};

// Export the module
module.exports = helpers;
