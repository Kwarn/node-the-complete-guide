const Product = require('../models/product');
const Cart = require('../models/cart');

const express = require('express');

exports.getProducts = (req, res, next) => {
  Product.findAll()
    .then(products => {
      res.render('shop/product-list', {
        products: products,
        pageTitle: 'All Products',
        path: '/products',
      });
    })
    .catch(err => console.log('error', err));
};

exports.getProduct = (req, res, next) => {
  const productId = req.params.productId;
  // Product.findAll({ where: { id: productId } })
  //   .then(products => {
  //     res.render('shop/product-detail', {
  //       product: products[0],
  //       pageTitle: `${products[0].title} Details`,
  //       path: '/product-list',
  //     });
  //   })
  //   .catch(err => console.log(err));

  Product.findByPk(productId)
    .then(product => {
      res.render('shop/product-detail', {
        product: product,
        pageTitle: `${product.title} Details`,
        path: '/product-list',
      });
    })
    .catch(err => console.log(err));
};

exports.postCartDeleteItem = (req, res, next) => {
  Cart.deleteProduct(req.body.productId, req.body.productPrice);
  res.redirect('/cart');
};

exports.postCart = (req, res, next) => {
  const productId = req.body.productId;
  Product.findById(productId, product => {
    Cart.addProduct(product.id, product.price);
  });
  res.redirect('/cart');
};

exports.getCartPage = (req, res, next) => {
  Cart.getCart(cart => {
    const cartProducts = [];
    Product.fetchAll(products => {
      for (let product of products) {
        const cartProduct = cart.products.find(p => p.id === product.id);
        if (cartProduct) {
          cartProducts.push({ product: product, qty: cartProduct.qty });
        }
      }
      res.render('shop/cart', {
        products: cartProducts,
        pageTitle: 'Shopping Cart',
        path: '/cart',
      });
    });
  });
};

exports.getOrdersPage = (req, res, next) => {
  res.render('shop/orders', {
    pageTitle: 'Orders',
    path: '/orders',
  });
};

exports.getIndex = (req, res, next) => {
  Product.findAll()
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
  });
};
