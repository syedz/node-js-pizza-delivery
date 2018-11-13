/**
 * Create and export configuration object
 */

var secretEnv = require('../.env');

// Container for all environments
var env = {};

// Staging environment (default)
env.staging = {
    httpPort: 3000,
    httpsPort: 3001,
    envName: 'staging',
    stripeSk: secretEnv.staging.stripeSk,
    mailGunApiKey: secretEnv.staging.mailGunApiKey
};

env.production = {
    httpPort: 5000,
    httpsPort: 5001,
    envName: 'production',
    stripeSk: secretEnv.production.stripeSk,
    mailGunApiKey: secretEnv.production.mailGunApiKey
};

// Determine which environment was passed as a command-line argument
var currentEnv = typeof process.env.NODE_ENV == 'string' ? process.env.NODE_ENV.toLowerCase() : '';

// Check if that environment exists and if it doesn't default to staging
var envToExport = typeof env[currentEnv] == 'object' ? env[currentEnv] : env.staging;

module.exports = envToExport;
