const express = require('express');
const { check, body } = require('express-validator');

const router = express.Router();
const authController = require('../controllers/auth');
const User = require('../models/user');

router.get('/login', authController.getLogin);
router.post(
  '/login',
  [
    check('email', 'Please enter a valid email').isEmail(),
    check(
      'password',
      'Your password will be at least 5 characters long and contain only numbers and letters.'
    )
      .isLength({ min: 5 })
      .isAlphanumeric(),
  ],
  authController.postLogin
);
router.post('/logout', authController.postLogout);
router.get('/signup', authController.getSignup);
router.post(
  '/signup',
  [
    check('email', 'Please enter a valid email')
      .isEmail()
      .custom((value, { req }) => {
        // if (value === 'test@test.com') {
        //   throw new Error('This email address is forbidden');
        // }
        // return true;
        return User.findOne({ email: value }).then(userDoc => {
          if (userDoc) {
            return Promise.reject(
              'Email address already exists, try signing in?'
            );
          }
        });
      }),
    body(
      'password',
      'Password must be at least 5 characters long and contain only numbers and letters.'
    )
      .isLength({ min: 5 })
      .isAlphanumeric(),
    body('confirmPassword', 'Passwords do not match.').custom(
      (value, { req }) => {
        if (value !== req.body.password) {
          throw new Error('Passwords have to match.');
        }
        return true;
      }
    ),
  ],
  authController.postSignup
);
router.get('/reset', authController.getReset);
router.post('/reset', authController.postReset);
router.get('/new-password/:token', authController.getNewPassword);
router.post('/new-password', authController.postNewPassword);

module.exports = router;
