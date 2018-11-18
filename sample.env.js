/**
 * Export secret configuration object
 */

// Container for all environments
var env = {};

// Staging environment (default)
env.staging = {
    hashingSecret: 'SOME_HASHING_SECRET',
    stripeSk: 'YOUR_STRIPE_SECRET_SK:',
    mailGunApiKey: 'api:YOUR_MAIL_GUN_API_KEY'
};

env.production = {
    hashingSecret: 'SOME_HASHING_SECRET',
    stripeSk: 'YOUR_STRIPE_SECRET_SK:',
    mailGunApiKey: 'api:YOUR_MAIL_GUN_API_KEY'
};

module.exports = env;
