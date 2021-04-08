const Product = require('../models/product');
// const Cart = require('../models/cart');
// const Order = require('../models/order');
const express = require('express');
const User = require('../models/user');

exports.getProducts = (req, res, next) => {
  Product.fetchAll()
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
  Product.findById(productId)
    .then(product => {
      console.log(product);
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
    .getCart()
    .then(products =>
      res.render('shop/cart', {
        products: products,
        pageTitle: 'Shopping Cart',
        path: '/cart',
      })
    )
    .catch(error => console.log(`GetCartPage error`, error));
};

exports.getOrdersPage = (req, res, next) => {
  let orders;
  req.user
    .getOrders({ include: ['products'] })
    .then(orders => {
      res.render('shop/orders', {
        pageTitle: 'Orders',
        path: '/orders',
        orders: orders,
      });
    })
    .catch(error => console.log(`error`, error));
};

exports.getIndex = (req, res, next) => {
  Product.fetchAll()
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

exports.postOrder = (req, res, next) => {
  let fetchedCart;
  req.user
    .getCart()
    .then(cart => {
      fetchedCart = cart;
      return cart.getProducts();
    })
    .then(products =>
      req.user.createOrder().then(order =>
        order.addProducts(
          products.map(p => {
            p.orderItem = { qty: p.cartItem.qty };
            return p;
          })
        )
      )
    )
    .then(result => fetchedCart.setProducts(null))
    .then(result => {
      res.redirect('/orders');
    })
    .catch(err => console.log(`err`, err));
};
