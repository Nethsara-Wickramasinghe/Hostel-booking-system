const router = require('express').Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const { register, login, me } = require('../controllers/auth');

router.post(
  '/register',
  [
    body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
    body('email').trim().isEmail().withMessage('Enter a valid email').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  validate,
  register
);
router.post(
  '/login',
  [body('email').trim().isEmail().withMessage('Enter a valid email').normalizeEmail(), body('password').notEmpty().withMessage('Password is required')],
  validate,
  login
);
router.get('/me', protect, me);
module.exports = router;
