const { body } = require('express-validator');

const newsValidator = [
    body('news')
        .trim()
        .notEmpty().withMessage('News is required')
        .isString().withMessage('News must be a string')
        .isLength({ min: 10 }).withMessage('News must be at least 10 characters')
        .isLength({ max: 1000 }).withMessage('News must not exceed 1000 characters'),
];

module.exports = {
    newsValidator
}