/**
 * Primary file for the API
 */

// Dependencies
var server = require('./lib/server');
var cli = require('./lib/cli');

// Declare the app
var app = {};

// Initialize function
app.init = function() {
    // Start the server
    server.init();

    // Start the CLI, but make sure it starts last
    setTimeout(function() {
        cli.init();
    }, 50);
};

// Execute the app
app.init();

// Export the app
module.exports = app;
