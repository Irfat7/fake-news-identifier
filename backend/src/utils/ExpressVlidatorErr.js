class ExpressValidatorError extends Error{
    constructor(result){
        const {errors} = result;
        super(errors[0].msg)
    }
}

module.exports = ExpressValidatorError;