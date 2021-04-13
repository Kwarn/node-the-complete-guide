const Product = require('../models/product');
const mongodb = require('mongodb');
const express = require('express');
const router = express.Router();

exports.getAddProductPage = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Products',
    path: '/admin/add-product',
    editing: false,
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;
  const product = new Product({
    title: title,
    price: price,
    description: description,
    imageUrl: imageUrl,
  });
  product
    .save()
    .then(result => {
      console.log('Created Product');
      res.redirect('/admin/product-list');
    })
    .catch(err => console.log(`err`, err));
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
        });
      } else {
        res.redirect('/');
      }
    })
    .catch(err => console.log('err', err));
};

exports.postEditProduct = (req, res, next) => {
  const product = new Product(
    req.body.title,
    req.body.imageUrl,
    req.body.price,
    req.body.description,
    req.body.productId
  );
  return product
    .save()
    .then(result => {
      console.log('Product Updated');
      res.redirect('/');
    })
    .catch(err => console.log('err', err));
};

exports.postDeleteProduct = (req, res, next) => {
  Product.deleteById(req.body.productId)
    .then(() => {
      console.log('Product Destroyed');
      res.redirect('/admin/product-list');
    })
    .catch(err => console.log(err));
};

exports.getAdminProductList = (req, res, next) => {
  Product.fetchAll()
    .then(products => {
      res.render('admin/product-list', {
        products: products,
        pageTitle: 'Admin Product List',
        path: '/admin/product-list',
      });
    })
    .catch(err => console.log('err', err));
};
