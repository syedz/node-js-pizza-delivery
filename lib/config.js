/**
 * Create and export configuration object
 */

// Container for all environments
var env = {};

// Staging environment (default)
env.staging = {
    httpPort: 3000,
    envName: 'staging'
};

env.production = {
    httpPort: 5000,
    envName: 'production'
};

// Determine which environment was passed as a command-line argument
var currentEnv =
    typeof process.env.NODE_ENV == 'string'
        ? process.env.NODE_ENV.toLowerCase()
        : '';

// Check if that environment exists and if it doesn't default to staging
var envToExport =
    typeof env[currentEnv] == 'object' ? env[currentEnv] : env.staging;

module.exports = envToExport;
