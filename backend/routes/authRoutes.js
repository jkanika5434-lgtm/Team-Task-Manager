const express = require('express');
const router = express.Router();
const { signup, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { body } = require('express-validator');

// Validation rules
const signupValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password min 6 characters'),
];

router.post('/signup', signupValidation, signup);
router.post('/login', login);
router.get('/me', protect, getMe); // Protected — token chahiye

module.exports = router;
console.log(getMe);