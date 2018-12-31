/**
 * Unit Tests
 */

// Dependencies
var helpers = require('./../lib/helpers');
var assert = require('assert');

// Holder for tests
var unit = {};

// Assert that the parseJsonToObject function is returning JSON
unit['helpers.parseJsonToObject should return JSON'] = function(done) {
    var val = helpers.parseJsonToObject();
    assert.equal(Object.keys(val).length, 0);
    done();
};

// Export the test to the runner
module.exports = unit;
