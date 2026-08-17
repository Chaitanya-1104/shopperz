const { body } = require('express-validator');

const postCreateValidator = [
  body('title').isString().trim().isLength({ min: 3 }).withMessage('Title too short'),
  body('summary').isString().trim().isLength({ min: 10 }).withMessage('Summary too short'),
  body('content').isString().trim().isLength({ min: 20 }).withMessage('Content too short'),
];

module.exports = { postCreateValidator };
