const { validationResult } = require('express-validator');
const { ValidationError } = require('sequelize');
const ExpressValidatorError = require('../utils/ExpressVlidatorErr');

function validate(req, res, next) {
    const result = validationResult(req);
    if (result.isEmpty()) return next()
    
    next(new ExpressValidatorError(result));
}

module.exports = validate;