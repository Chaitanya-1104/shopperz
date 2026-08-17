const { body } = require('express-validator');

const registerValidator = [
  body('username')
    .isString()
    .trim()
    .isLength({ min: 4 })
    .withMessage('Username must be at least 4 characters'),
  body('password')
    .isString()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
];

const loginValidator = [
  body('username').isString().trim().notEmpty(),
  body('password').isString().notEmpty(),
];

module.exports = { registerValidator, loginValidator };
