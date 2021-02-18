const products = [];

const express = require('express');
const router = express.Router();

exports.renderAddProductPage = (req, res, next) => {
  res.render('add-product', {
    pageTitle: 'Add Products',
    path: '/admin/add-product',
  });
};

exports.postAddProduct = router.post('/add-product', (req, res, next) => {
  products.push({ title: req.body.title });
  res.redirect('/');
});

exports.getProducts = router.get('/', (req, res, next) => {
  res.render('shop', {
    products: products,
    pageTitle: 'Shop',
    path: 'shop',
  });
});
