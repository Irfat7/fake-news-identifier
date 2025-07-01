const { validationResult } = require('express-validator');
const formatValidationErrors = require('../utils/formatValidationErrors');

function validate(req, res, next) {
    const { errors } = validationResult(req);
    if (errors.length > 0) {
        const formattedErrors = formatValidationErrors(errors)
        return res.status(422).json({
            status: 'fail',
            errors: formattedErrors
        });
    }
    next();
}

module.exports = validate;