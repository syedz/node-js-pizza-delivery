/**
 * Helpers for various tasks
 */

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

// Export the module
module.exports = helpers;
