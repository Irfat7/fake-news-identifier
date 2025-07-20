const { body } = require('express-validator');

const newsValidator = [
    body('news')
        .trim()
        .notEmpty().withMessage('News is required')
        .isString().withMessage('News must be a string')
        .isLength({ min: 10 }).withMessage('News must be at least 10 characters')
        .isLength({ max: 1000 }).withMessage('News must not exceed 1000 characters'),
];

const feedbackValidator = [
    body('news')
        .trim()
        .notEmpty().withMessage('News is required')
        .isString().withMessage('News must be a string')
        .isLength({ min: 10 }).withMessage('News must be at least 10 characters')
        .isLength({ max: 1000 }).withMessage('News must not exceed 1000 characters'),

    body('prediction')
        .notEmpty().withMessage('Prediction is required')
        .isBoolean().withMessage('Prediction must be a boolean'),

    body('label')
        .notEmpty().withMessage('Correct label is required')
        .isBoolean().withMessage('Correct label must be a boolean'),

    body('token')
        .notEmpty().withMessage('Prediction token is required')
        .isString().withMessage('Prediction token must be a string'),
];

module.exports = {
    newsValidator,
    feedbackValidator
}