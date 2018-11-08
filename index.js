/**
 * Primary file for the API
 */

// Dependencies
var server = require('./lib/server');

// Declare the app
var app = {};

// Initialize function
app.init = function() {
    // Start the server
    server.init();
};

// Execute the app
app.init();

// Export the app
module.exports = app;
