/**
 * Primary file for the API
 */

// Dependencies
var server = require('./lib/server');
var cli = require('./lib/cli');

// Declare the app
var app = {};

// Initialize function
app.init = function(callback) {
    // Start the server
    server.init();

    // Start the CLI, but make sure it starts last
    setTimeout(function() {
        cli.init();
        callback();
    }, 50);
};
// Self invoking only if required directly
if (require.main === module) {
    app.init(function() {});
}

// Export the app
module.exports = app;
