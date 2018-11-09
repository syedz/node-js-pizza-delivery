/**
 * HTTP Status Codes
 */

var states = {
    OK: {
        statusCode: 200,
        message: 'OK'
    };
    SOMETHING_WRONG: {
        statusCode: 501,
        message: 'Something went'
    },
    SOMETHING_WRONG_AGAIN: {
        statusCode: 502,
        message: 'Something went again'
    }
};

module.exports = states;
