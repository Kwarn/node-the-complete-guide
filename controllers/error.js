const express = require('express');
const router = express.Router();

exports.getError404Page = (req, res, next) => {
  res
    .status(404)
    .render('404', {
      pageTitle: '404 Error: Page Not Found',
      path: '/404',
    });
};
