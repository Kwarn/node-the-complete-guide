const path = require('path');
const rootDir = require('../util/path');

const express = require('express');

const router = express.Router();

const adminData = require('./admin');

router.get('/', (req, res, next) => {
  const products = adminData.products;
  res.render('shop', {
    products: products,
    pageTitle: 'Shop',
    path: 'shop',
    hasProducts: products.length > 0,
    activeShop: true,
    productCSS: true,
  });

  // res.sendFile(path.join(rootDir, 'views', 'shop.html'));
});

exports.routes = router;
