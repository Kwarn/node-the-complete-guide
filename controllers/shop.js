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
  const productId = req.body.productId;
  req.user
    .getCart()
    .then(cart => {
      return cart.getProducts({ where: { id: productId } });
    })
    .then(products => {
      const product = products[0];
      return product.cartItem.destroy();
    })
    .then(result => res.redirect('/cart'))
    .catch(error => console.log(`error`, error));
};

exports.postCart = (req, res, next) => {
  const productId = req.body.productId;
  let newQty = 1;
  let fetchedCart;
  req.user
    .getCart()
    .then(cart => {
      fetchedCart = cart;
      return cart.getProducts({ where: { id: productId } });
    })
    .then(products => {
      let product;
      if (products.length > 0) {
        product = products[0];
      }
      if (product) {
        newQty = product.cartItem.qty + 1;
        return product;
      }
      return Product.findByPk(productId);
    })
    .then(product =>
      fetchedCart.addProduct(product, { through: { qty: newQty } })
    )
    .then(() => {
      res.redirect('/cart');
    })
    .catch(error => console.log(`error`, error));
};

exports.getCartPage = (req, res, next) => {
  req.user
    .getCart()
    .then(cart =>
      cart
        .getProducts()
        .then(products =>
          res.render('shop/cart', {
            products: products,
            pageTitle: 'Shopping Cart',
            path: '/cart',
          })
        )
        .catch(error => console.log(`error`, error))
    )
    .catch(err => console.log(`err`, err));
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
