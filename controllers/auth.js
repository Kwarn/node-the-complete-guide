const User = require('../models/user');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const { validationResult } = require('express-validator');
const crypto = require('crypto');

const createError = (error, next) => {
  const _error = new Error(error);
  _error.httpStatusCode = 500;
  return next(_error);
};

const transport = nodemailer.createTransport({
  host: 'smtp.mailtrap.io',
  port: 2525,
  auth: {
    user: 'e218f20c438976',
    pass: '0ce454dc9c8479',
  },
});

transport.verify(function (error, success) {
  if (error) {
    console.log(error);
  } else {
    console.log('Server is ready to take our messages');
  }
});

exports.getLogin = (req, res, next) => {
  let message = req.flash('Login Error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('auth/login', {
    pageTitle: 'Login',
    path: '/login',
    errorMessage: message,
    previousLoginDetails: { email: '' },
    validationErrors: [],
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const errors = validationResult(req);

  function renderLoginPage(error, errors = []) {
    return res.status(422).render('auth/login', {
      path: '/login',
      pageTitle: 'Login',
      errorMessage: error,
      previousLoginDetails: { email: email },
      validationErrors: errors,
    });
  }

  if (!errors.isEmpty()) {
    return renderLoginPage(errors.array()[0].msg, errors.array());
  }
  User.findOne({ email: email })
    .then(user => {
      if (!user) {
        return renderLoginPage('Invalid email or password.');
      }
      bcrypt
        .compare(password, user.password)
        .then(doMatch => {
          if (doMatch) {
            req.session.isLoggedIn = true;
            req.session.user = user;
            return req.session.save(() => {
              res.redirect('/');
            });
          }
          return renderLoginPage('Invalid email or password.');
        })
        .catch(err => {
          console.log(`bcrypt compare err`, err);
          res.redirect('/login');
        });
    })
    .catch(err => createError(err, next));
};

exports.postLogout = (req, res, next) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
};

exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const errors = validationResult(req).array();
  if (errors.length > 0) {
    console.log('validation Errors --', errors);
    return res.status(422).render('auth/signup', {
      path: '/signup',
      pageTitle: 'Signup',
      errorMessage: errors[0].msg,
      previousLoginDetails: {
        email: email,
      },
      validationErrors: errors,
    });
  }

  bcrypt
    .hash(password, 12)
    .then(encryptedPass => {
      const newUser = new User({
        email: email,
        password: encryptedPass,
        cart: { items: [] },
      });
      return newUser.save();
    })
    .then(result => {
      res.redirect('/login');
      return transport.sendMail({
        from: 'shop@nodecomplete.com',
        to: email,
        subject: 'Signup Success',
        html: '<h1>Successful sign up</h1>',
      });
    })
    .catch(err => createError(err, next));
};

exports.getSignup = (req, res, next) => {
  let message = req.flash('User Exists Error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Signup',
    errorMessage: message,
    previousLoginDetails: {
      email: '',
    },
    validationErrors: [],
  });
};

exports.getReset = (req, res, next) => {
  let message = req.flash('Reset Error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }

  res.render('auth/reset', {
    pageTitle: 'Reset Password',
    path: '/reset',
    errorMessage: message,
  });
};

exports.postReset = (req, res, next) => {
  crypto.randomBytes(32, (error, buffer) => {
    if (error) {
      console.log(error);
      res.redirect('/reset');
    }
    const token = buffer.toString('hex');
    User.findOne({ email: req.body.email })
      .then(user => {
        if (!user) {
          req.flash('Reset Error', 'No account with that email found.');
          return res.redirect('/reset');
        }
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000;
        return user.save();
      })
      .then(result => {
        res.redirect('/');
        transport.sendMail({
          from: 'shop@nodecomplete.com',
          to: req.body.email,
          subject: 'Reset Password Request',
          html: `
            <p> Password Reset Requested </p>
            <p> Click this <a href="http://localhost:3000/new-password/${token}" >link to set a new password.</p> 
          `,
        });
      })
      .catch(err => createError(err, next));
  });
};

exports.getNewPassword = (req, res, next) => {
  const token = req.params.token;
  let message = req.flash('Reset Error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
    .then(user => {
      res.render('auth/new-password', {
        pageTitle: 'New Password',
        path: 'auth/new-password',
        errorMessage: message,
        userId: user._id.toString(),
        passwordToken: token,
      });
    })
    .catch(err => createError(err, next));
};

exports.postNewPassword = (req, res, next) => {
  const newPassword = req.body.password;
  const userId = req.body.userId;
  const token = req.body.passwordToken;
  let _user;
  User.findOne({
    resetToken: token,
    resetTokenExpiration: { $gt: Date.now() },
    _id: userId,
  })
    .then(user => {
      _user = user;
      return bcrypt.hash(newPassword, 12);
    })
    .then(hashedPassword => {
      _user.password = hashedPassword;
      _user.resetToken = null;
      _user.resetTokenExpiration = undefined;
      return _user.save();
    })
    .then(result => {
      res.redirect('/login');
    })
    .catch(err => createError(err, next));
};
