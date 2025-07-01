const { UniqueConstraintError } = require('sequelize');
const ExpressValidatorError = require('../utils/ExpressValidatorErr');

module.exports = (err, req, res, next) => {
    if(err instanceof UniqueConstraintError){
        return res.error(409, "Unique constraint violation")
    }
    if(err instanceof ExpressValidatorError){
        return res.error(409, err.message);
    }
}