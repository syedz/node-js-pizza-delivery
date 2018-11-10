/**
 * HTTP Status Codes
 */

var states = {
    OK: {
        statusCode: 200,
        message: 'OK'
    },
    BAD_REQUEST: {
        statusCode: 400,
        message: 'Bad Request'
    },
    NOT_FOUND: {
        statusCode: 404,
        message: 'Not Found'
    },
    METHOD_NOT_ALLOWED: {
        statusCode: 405,
        message: 'Method Not Allowed'
    },
    SOMETHING_WRONG: {
        statusCode: 501,
        message: 'Something went'
    },
    SOMETHING_WRONG_AGAIN: {
        statusCode: 502,
        message: 'Something went again'
    },
    CANT_CREATE_FILE: {
        statusCode: 510,
        message: "Can't create file"
    },
    CANT_EDIT_FILE: {
        statusCode: 511,
        message: "Can't edit file"
    },
    CANT_DELETE_FILE: {
        statusCode: 512,
        message: "Can't delete file"
    }
};

module.exports = states;
