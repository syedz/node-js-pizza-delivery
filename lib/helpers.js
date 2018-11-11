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

// Export the module
module.exports = helpers;
