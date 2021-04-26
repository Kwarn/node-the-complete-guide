const User = require('../models/user');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const { validationResult } = require('express-validator');
const crypto = require('crypto');

var transport = nodemailer.createTransport({
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
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const error = validationResult(req).array()[0];
  if (error) {
    return res.status(422).render('auth/login', {
      path: '/login',
      pageTitle: 'Login',
      errorMessage: error.msg,
      previousLoginDetails: { email: email },
    });
  }
  User.findOne({ email: email }).then(user => {
    if (!user) {
      req.flash('Login Error', 'Invalid Email or Password');
      return res.redirect('/login');
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
        res.redirect('/login');
      })
      .catch(err => {
        console.log(`bcrypt compare err`, err);
        res.redirect('/login');
      });
  });
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
  // console.log('validation Errors --', errors);
  if (errors) {
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
    });
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
      .catch(error => console.log(`postReset User.findOne error`, error));
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
    .catch(error => {
      console.log(`getNewPassword User.findOne(Token match) --`, error);
    });
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
    .catch(error => {
      console.log(`postNewPassword User.findOne() error -- `, error);
    });
};
