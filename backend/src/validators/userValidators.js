const { body } = require('express-validator');

const createUserValidator = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').trim().isEmail().withMessage('Valid email is required'),
  body('password').trim().isLength({ min: 6 }).withMessage('Password must be 6+ chars')
];

const signinValidator = [
  body('email').trim().isEmail().withMessage('Valid email is required'),
  body('password').trim().isLength({ min: 6 }).withMessage('Password must be 6+ chars')
];

module.exports = {
  createUserValidator,
  signinValidator
}