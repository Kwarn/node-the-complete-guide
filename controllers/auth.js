const User = require('../models/user');

exports.getLogin = (req, res, next) => {
  res.render('auth/login', {
    pageTitle: 'Login',
    path: '/login',
    isAuthenticated: false,
  });
};

exports.postLogin = (req, res, next) => {
  User.findById('6076a37601d5191d4ff2fb69')
    .then(user => {
      req.session.isLoggedIn = true;
      req.session.user = user;
      // session.save() is called here to guarantee session.user is saved
      // before a potential out of sync redirect to '/' which itself relies on session.user.
      req.session.save(err => {
        res.redirect('/');
      });
    })
    .catch(err => console.log(`Error`, err));
};

exports.postLogout = (req, res, next) => {
  req.session.destroy(err => {
    console.log(`postLogout error`, err);
    res.redirect('/');
  });
};
