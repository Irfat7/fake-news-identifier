const { UniqueConstraintError } = require('sequelize');
const ExpressValidatorError = require('../utils/ExpressVlidatorErr');

function globalErrorHandler(err, req, res, next) {
    if(err instanceof UniqueConstraintError){
        return res.send({code: 409, message: err.message})
    }
    if(err instanceof ExpressValidatorError){
        return res.send({code: 422, message: err.message})
    }
}

module.exports = globalErrorHandler