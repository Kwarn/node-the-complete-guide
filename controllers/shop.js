const Product = require('../models/product');
// const Cart = require('../models/cart');
// const Order = require('../models/order');
const express = require('express');
const User = require('../models/user');
const Order = require('../models/order');

exports.getProducts = (req, res, next) => {
  Product.find()
    .then(products => {
      res.render('shop/product-list', {
        products: products,
        pageTitle: 'All Products',
        path: '/products',
        isAuthenticated: req.session.user,
      });
    })
    .catch(err => console.log('error', err));
};

exports.getProduct = (req, res, next) => {
  const productId = req.params.productId;
  Product.findById(productId)
    .then(product => {
      console.log(product);
      res.render('shop/product-detail', {
        product: product,
        pageTitle: `${product.title} Details`,
        path: '/product-list',
        isAuthenticated: req.session.user,
      });
    })
    .catch(err => console.log(err));
};

exports.postCartDeleteItem = (req, res, next) => {
  const productId = req.body.productId;
  req.user
    .removeFromCart(productId)
    .then(result => res.redirect('/cart'))
    .catch(error => console.log(`error`, error));
};

exports.postCart = (req, res, next) => {
  const productId = req.body.productId;
  Product.findById(productId)
    .then(product => {
      return req.user.addToCart(product);
    })
    .then(() => {
      res.redirect('/cart');
    })
    .catch(error => console.log(`error`, error));
};

exports.getCartPage = (req, res, next) => {
  req.user
    .populate('cart.items.productId')
    .execPopulate()
    .then(user => {
      const products = user.cart.items;
      res.render('shop/cart', {
        products: products,
        pageTitle: 'Shopping Cart',
        path: '/cart',
        isAuthenticated: req.session.user,
      });
    })
    .catch(error => console.log(`GetCartPage error`, error));
};

exports.getOrdersPage = (req, res, next) => {
  Order.find({ 'user.userId': req.session.user._id })
    .then(orders => {
      res.render('shop/orders', {
        pageTitle: 'Orders',
        path: '/orders',
        orders: orders,
        isAuthenticated: req.session.user,
      });
    })
    .catch(error => console.log(`error`, error));
};

exports.getIndex = (req, res, next) => {
  Product.find()
    .then(products => {
      res.render('shop/index', {
        products: products,
        pageTitle: 'Shop',
        path: 'shop',
      });
    })
    .catch(err => console.log('error', err));
};

exports.getCheckoutPage = (req, res, next) => {
  res.render('shop/checkout', {
    pageTitle: 'Checkout',
    path: '/checkout',
    isAuthenticated: req.session.user,
  });
};

exports.postOrder = (req, res, next) => {
  req.user
    .populate('cart.items.productId')
    .execPopulate()
    .then(user => {
      console.log('postOrder', user);
      const products = user.cart.items.map(p => {
        return {
          product: { ...p.productId._doc },
          qty: p.qty,
        };
      });
      const order = new Order({
        products: products,
        user: {
          email: req.session.user.email,
          userId: req.session.user,
        },
      });
      order.save();
    })
    .then(result => {
      req.user.clearCart();
    })
    .then(result => {
      res.redirect('/orders');
    })
    .catch(err => console.log(`Post Order Error`, err));
};
