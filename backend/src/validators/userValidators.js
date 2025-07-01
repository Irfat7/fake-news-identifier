const { body } = require('express-validator');

const createUserValidator = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be 6+ chars')
];

module.exports = {
    createUserValidator,
}