const { validationResult } = require('express-validator');
const ExpressValidatorError = require('../utils/ExpressValidatorErr');

module.exports = (req, res, next) => {
    const result = validationResult(req);
    if (result.isEmpty()) return next()

    next(new ExpressValidatorError(result));
}