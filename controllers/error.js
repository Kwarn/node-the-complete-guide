const express = require('express');
const router = express.Router();

exports.getError404Page = (req, res, next) => {
  res.status(404).render('404', {
    pageTitle: '404 Error: Page Not Found',
    path: '/404',
  });
};

exports.getError500Page = (req, res, next) => {
  res.status(500).render('500', {
    pageTitle: '500 Error: Page Not Found',
    path: '/500',
  });
};
