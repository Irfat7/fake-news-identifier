const { UniqueConstraintError } = require('sequelize');
const ExpressValidatorError = require('../utils/ExpressValidatorErr');
const jwt = require('jsonwebtoken');

module.exports = (err, req, res, next) => {
    if (err instanceof UniqueConstraintError) {
        return res.error(409, "Unique constraint violation")
    }
    if (err instanceof ExpressValidatorError) {
        return res.error(409, err.message);
    }
    if (err instanceof jwt.TokenExpiredError) {
        return res.error(401, "Token has expired");
    }

    if (err instanceof jwt.JsonWebTokenError) {
        return res.error(400, "Invalid token");
    }

    if (err instanceof jwt.NotBeforeError) {
        return res.error(400, "Token not active yet");
    }

    console.error(err);
    return res.error(500, "Internal Server Error");
}