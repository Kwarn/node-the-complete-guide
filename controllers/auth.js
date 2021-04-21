const User = require('../models/user');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');

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
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
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
  // const confirmPassword = req.body.confirmPassword;
  User.findOne({ email: email })
    .then(userDoc => {
      if (userDoc) {
        req.flash(
          'User Exists Error',
          'That email is already registered. Try signing in.'
        );
        return res.redirect('/signup');
      }
      return bcrypt
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
    })
    .catch(err => console.log(`Signup Error -- `, err));
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
  });
};
