const express = require('express');
const router = express.Router();
const { registerValidator, loginValidator } = require('../validators/authValidators');
const { register, login, profile, logout } = require('../controllers/authController');

const { validationResult } = require('express-validator');

// wrapper to run validators and handle errors
const runValidation = (validators) => async (req, res, next) => {
  for (let validator of validators) {
    await validator.run(req);
  }
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
};

router.post('/register', runValidation(registerValidator), register);
router.post('/login', runValidation(loginValidator), login);
router.get('/profile', profile);
router.post('/logout', logout);

module.exports = router;
