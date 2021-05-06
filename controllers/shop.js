const Product = require('../models/product');
const express = require('express');
const PDFDocument = require('pdfkit');
const User = require('../models/user');
const Order = require('../models/order');
const fs = require('fs');
const path = require('path');

const ITEMS_PER_PAGE = 2;

const createError = (error, next) => {
  const _error = new Error(error);
  _error.httpStatusCode = 500;
  return next(_error);
};

exports.getProducts = (req, res, next) => {
  const page = +req.query.page || 1;
  let totalProducts;
  Product.find()
    .countDocuments()
    .then(numProducts => {
      totalProducts = numProducts;
      return Product.find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    })
    .then(products => {
      res.render('shop/product-list', {
        products: products,
        pageTitle: 'Products',
        path: '/product-list',
        totalProducts: totalProducts,
        currentPage: page,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalProducts / ITEMS_PER_PAGE),
        hasNextPage: ITEMS_PER_PAGE * page < totalProducts,
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
    .catch(err => next(new Error('Error getting product')));
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
      });
    })
    .catch(error => console.log(`error`, error));
};

exports.getIndex = (req, res, next) => {
  const page = +req.query.page || 1;
  let totalProducts;
  Product.find()
    .countDocuments()
    .then(numProducts => {
      totalProducts = numProducts;
      return Product.find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    })
    .then(products => {
      res.render('shop/index', {
        products: products,
        pageTitle: 'Shop',
        path: 'shop',
        totalProducts: totalProducts,
        currentPage: page,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalProducts / ITEMS_PER_PAGE),
        hasNextPage: ITEMS_PER_PAGE * page < totalProducts,
      });
    })
    .catch(err => console.log('error', err));
};

exports.getCheckoutPage = (req, res, next) => {
  req.user
    .populate('cart.items.productId')
    .execPopulate()
    .then(user => {
      const products = user.cart.items;
      let totalPrice = 0;
      products.forEach(p => {
        totalPrice += p.qty * p.productId.price;
      });
      res.render('shop/checkout', {
        path: '/checkout',
        pageTitle: 'Checkout',
        products: products,
        totalPrice: totalPrice,
      });
    })
    .catch(error => createError(error, next));
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

exports.getInvoice = (req, res, next) => {
  const orderId = req.params.orderId;
  Order.findById(orderId)
    .then(order => {
      if (!order) return next(new Error('No order found.'));
      if (order.user.userId.toString() !== req.user._id.toString())
        return next(new Error('Not Allowed'));
      const invoiceName = 'invoice-' + orderId + '.pdf';
      const invoicePath = path.join('data', 'invoices', invoiceName);
      const pdfDoc = new PDFDocument();
      pdfDoc.pipe(fs.createWriteStream(invoicePath));
      pdfDoc.pipe(res);
      pdfDoc.fontSize(20).text('Invoice', { underline: true });
      pdfDoc.text('-----------------');
      let totalPrice = 0;
      order.products.forEach(p => {
        totalPrice += p.qty * p.product.price;
        pdfDoc
          .fontSize(14)
          .text(`${p.product.title} -- ${p.qty} -- x $${p.product.price}`);
      });
      pdfDoc.text('Total Price: $' + totalPrice);

      pdfDoc.end();
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        'inline; filename="' + invoiceName + '"'
      );
    })
    .catch(err => next(err));
};
