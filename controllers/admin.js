const Product = require('../models/product');
const mongodb = require('mongodb');
const express = require('express');
const router = express.Router();
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');
// const Error = require(err)

const errorHandler = (error, next) => {
  const _error = new Error(error);
  _error.httpStatusCode = 500;
  return next(_error);
};

exports.getAddProductPage = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Products',
    path: '/admin/add-product',
    editing: false,
    previousValues: [],
    errorMessage: null,
    validationErrors: [],
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;

  const errors = validationResult(req).errors;
  if (errors.length > 0) {
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Add Product',
      path: '/admin/edit-product',
      editing: false,
      previousValues: {
        title: title,
        imageUrl: imageUrl,
        price: price,
        description: description,
      },
      errorMessage: errors[0].msg,
      validationErrors: errors,
    });
  }

  const product = new Product({
    title: title,
    imageUrl: imageUrl,
    price: price,
    description: description,
    userId: req.session.user,
  });
  product
    .save()
    .then(result => {
      console.log('Created Product', result);
      res.redirect('/admin/product-list');
    })
    .catch(err => errorHandler(err, next));
};

exports.getEditProductPage = (req, res, next) => {
  const productId = req.params.productId;
  Product.findById(productId)
    .then(product => {
      if (product) {
        res.render('admin/edit-product', {
          product: product,
          pageTitle: 'Edit Products',
          path: '/admin/edit-product',
          editing: !!req.query.edit,
          errorMessage: '',
          validationErrors: [],
        });
      } else {
        res.redirect('/');
      }
    })
    .catch(err => errorHandler(err, next));
};

exports.postEditProduct = (req, res, next) => {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;
  const productId = req.body.productId;

  console.log('--------DESC----------', description);
  const errors = validationResult(req).errors;
  if (errors.length > 0) {
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Edit Product',
      path: '/admin/edit-product',
      editing: true,
      product: {
        _id: productId,
        title: title,
        imageUrl: imageUrl,
        price: price,
        description: description,
      },
      errorMessage: errors[0].msg,
      validationErrors: errors,
    });
  }
  Product.findById(productId)
    .then(product => {
      if (product.userId.toString() !== req.user._id.toString()) {
        return res.redirect('/');
      }
      product.title = title
      product.price = price
      product.description = description
      product.imageUrl = imageUrl
      product.userId = req.user;
      return product.save().then(result => {
        console.log('Product Updated');
        res.redirect('/');
      });
    })
    .catch(err => errorHandler(err, next));
};

exports.postDeleteProduct = (req, res, next) => {
  Product.deleteOne({ _id: req.body.productId, userId: req.user._id })
    .then(() => {
      console.log('Product Destroyed');
      res.redirect('/admin/product-list');
    })
    .catch(err => errorHandler(err, next));
};

exports.getAdminProductList = (req, res, next) => {
  Product.find({ userId: req.user._id })
    // .select('title price -_id')
    // .populate('userId, 'name')
    .then(products => {
      res.render('admin/product-list', {
        products: products,
        pageTitle: 'Admin Product List',
        path: '/admin/product-list',
      });
    })
    .catch(err => errorHandler(err, next));
};
