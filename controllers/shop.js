const Product = require('../models/product');

const express = require('express');
const router = express.Router();

exports.getProducts = router.get('/', (req, res, next) => {
  Product.fetchAll(products =>
    res.render('shop/product-list', {
      products: products,
      pageTitle: 'All Products',
      path: '/products',
    })
  );
});

exports.getCartPage = (req, res, next) => {
  res.render('shop/cart', {
    pageTitle: 'Shopping Cart',
    path: '/cart',
  });
};

exports.getIndex = (req, res, next) => {
  Product.fetchAll(products =>
    res.render('shop/index', {
      products: products,
      pageTitle: 'Shop',
      path: 'shop',
    })
  );
};

exports.getCheckoutPage = (req, res, next) => {
  res.render('shop/checkout', {
    pageTitle: 'Checkout',
    path: '/checkout'
  })
}
