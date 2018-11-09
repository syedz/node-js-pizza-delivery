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

// Export the module
module.exports = helpers;
