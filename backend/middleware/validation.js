const { body, param, validationResult } = require('express-validator');

// Validation middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      msg: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// User registration validation rules
const validateRegistration = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  body('first_name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('First name must be 2-50 characters and contain only letters'),
  body('last_name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Last name must be 2-50 characters and contain only letters'),
  handleValidationErrors
];

// User login validation rules
const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

// Course ID validation
const validateCourseId = [
  param('id')
    .isUUID()
    .withMessage('Invalid course ID format'),
  handleValidationErrors
];

// User ID validation
const validateUserId = [
  param('user_id')
    .isUUID()
    .withMessage('Invalid user ID format'),
  handleValidationErrors
];

// Progress completion validation
const validateProgressCompletion = [
  body('user_id')
    .isUUID()
    .withMessage('Invalid user ID format'),
  body('exercise_id')
    .isUUID()
    .withMessage('Invalid exercise ID format'),
  handleValidationErrors
];

// Individual validation functions for testing
const validateEmail = () => 
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address');

const validatePassword = () =>
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character');

module.exports = {
  validateRegistration,
  validateLogin,
  validateCourseId,
  validateUserId,
  validateProgressCompletion,
  handleValidationErrors,
  validateEmail,
  validatePassword
};