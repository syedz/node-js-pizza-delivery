/**
 * CLI-Related Tasks
 */

// Dependencies
var readline = require('readline');
var util = require('util');
var debug = util.debuglog('cli');

var events = require('events');
class _events extends events {}
var e = new _events();

var _inventory = require('./inventory');
var _data = require('./data');

// Instantiate the CLI module object
var cli = {};

// Input handlers
e.on('man', function() {
    cli.responders.help();
});

e.on('help', function() {
    cli.responders.help();
});

e.on('exit', function() {
    cli.responders.exit();
});

e.on('menu', function() {
    cli.responders.menu();
});

e.on('orders', function(str) {
    cli.responders.orders(str);
});

e.on('order', function(str) {
    cli.responders.order(str);
});

e.on('users', function(str) {
    cli.responders.users(str);
});

e.on('user', function(str) {
    cli.responders.user(str);
});

// Responders object
cli.responders = {};

// Help / Man
cli.responders.help = function() {
    var commands = {
        man: 'Show this help page',
        help: 'Alias of the "man" command',
        exit: 'Kill the CLI (and the rest of the application)',
        menu: 'Show a list of all the menu items',
        orders: 'Show a list of all the orders within the last 24 hours',
        'order --{orderId}': 'Show details of a specific order',
        users: 'Show a list of all the users signed up within the last 24 hours',
        'user --{userId}': 'Show details of a specific user'
    };

    // Show a header for the help page that is as wide as the screen
    cli.horizontalLine();
    cli.centered('CLI MANUAL');
    cli.horizontalLine();
    cli.verticalSpace(2);

    // Show each command, followed by its explanation, in white and yellow respectively
    for (var key in commands) {
        if (commands.hasOwnProperty(key)) {
            var value = commands[key];
            var line = '\x1b[33m' + key + '\x1b[0m';
            var padding = 30 - line.length;

            for (i = 0; i < padding; i++) {
                line += ' ';
            }

            // Append the value to the end of the line after the padding
            line += value;
            console.log(line);
            cli.verticalSpace();
        }
    }

    cli.verticalSpace(1);

    // End with another horizontal line
    cli.horizontalLine();
};

// Exit
cli.responders.exit = function() {
    process.exit(0);
};

// Menu items
cli.responders.menu = function() {
    // Show a header for the menu page
    cli.horizontalLine();
    cli.centered('MENU ITEMS');
    cli.horizontalLine();
    cli.verticalSpace(2);

    console.table(_inventory);
};

// All orders
cli.responders.orders = function() {
    console.log('orders');
};

// Order details
cli.responders.order = function(str) {
    console.log('order', str);
};

// All users
cli.responders.users = function() {
    // Show a header for the users page
    cli.horizontalLine();
    cli.centered('ALL USERS');
    cli.horizontalLine();
    cli.verticalSpace(2);

    _data.list('users', function(err, emails) {
        if (!err && emails && emails.length > 0) {
            cli.verticalSpace();

            emails.forEach(function(email) {
                _data.read('users', email, function(err, userData) {
                    if (!err && userData) {
                        cli.horizontalLine();
                        cli.verticalSpace();

                        console.log('\x1b[34m%s\x1b[0m', 'Name: ' + userData.fullName);
                        console.log('Email:', userData.email);
                        console.log('Street Address:', userData.streetAddress);

                        if (userData.cart.length > 0) {
                            console.table(userData.cart);
                        } else {
                            console.log('\x1b[31m%s\x1b[0m', 'Cart is empty');
                        }
                        cli.verticalSpace();
                    }
                });
            });
        }
    });
};

// All user
cli.responders.user = function(str) {
    // Get the ID from the string
    var arr = str.split('--');
    var userId = typeof arr[1] == 'string' && arr[1].trim().length > 0 ? arr[1].trim() : false;

    if (userId) {
        // Lookup the user
        _data.read('users', userId, function(err, userData) {
            if (!err && userData) {
                cli.horizontalLine();
                cli.verticalSpace();

                console.log('\x1b[34m%s\x1b[0m', 'Name: ' + userData.fullName);
                console.log('Email:', userData.email);
                console.log('Street Address:', userData.streetAddress);

                if (userData.cart.length > 0) {
                    console.table(userData.cart);
                } else {
                    console.log('\x1b[31m%s\x1b[0m', 'Cart is empty');
                }
                cli.verticalSpace();
            }
        });
    }
};

// Create a vertical space
cli.verticalSpace = function(lines) {
    lines = typeof lines == 'number' && lines > 0 ? lines : 1;

    for (i = 0; i < lines; i++) {
        console.log('');
    }
};

// Create a horizontal line across the screen
cli.horizontalLine = function() {
    // Get the available screen size
    var width = process.stdout.columns;

    var line = '';
    for (i = 0; i < width; i++) {
        line += '-';
    }

    console.log(line);
};

// Create centered text on the screen
cli.centered = function(str) {
    str = typeof str == 'string' && str.trim().length > 0 ? str.trim() : '';

    // Get the available screen size
    var width = process.stdout.columns;

    // Calculate the left padding there should be
    var leftPadding = Math.floor((width - str.length) / 2);

    // Put in left padding spaces before the string itself
    var line = '';
    for (i = 0; i < leftPadding; i++) {
        line += ' ';
    }

    line += str;
    console.log(line);
};

cli.processInput = function(str) {
    str = typeof str == 'string' && str.trim().length > 0 ? str.trim() : false;
    // Only process the input if the user actually wrote something, otherwise ignore it

    if (str) {
        // Codify the unique strings that identify the unique questions allowed to be asked
        var uniqueInputs = ['man', 'help', 'exit', 'menu', 'orders', 'order', 'users', 'user'];

        // Go through the possible inputs, emit an event when a match is found
        var matchFound = false;
        var counter = 0;

        uniqueInputs.some(function(input) {
            if (str.toLowerCase().indexOf(input) > -1) {
                matchFound = true;
                // Emit an event matching the unique input, and include hte full string given
                e.emit(input, str);

                return true;
            }
        });

        // If no match is found, tell the user to try again
        if (!matchFound) {
            console.log('Sorry, try again');
        }
    }
};

// Init script
cli.init = function() {
    // Send the start message to the console, in dark blue
    console.log('\x1b[34m%s\x1b[0m', 'The CLI is running');

    // Start the interface
    var _interface = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: '>'
    });

    // Create an initial prompt
    _interface.prompt();

    // Handle each line of input separately
    _interface.on('line', function(str) {
        // Send to the input processor
        cli.processInput(str);

        // Re-initialize the prompt afterwards
        _interface.prompt();
    });

    // If the user stops the CLI, kill the associated process
    _interface.on('close', function() {
        process.exit(0);
    });
};

// Export the module
module.exports = cli;
