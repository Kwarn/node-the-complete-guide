const Product = require('../models/product');

const express = require('express');
const router = express.Router();

exports.getAddProductPage = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Products',
    path: '/admin/add-product',
    editing: false,
  });
};

exports.getEditProductPage = (req, res, next) => {
  const productId = req.params.productId;
  Product.findByPk(productId)
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
  Product.findByPk(req.body.productId)
    .then(product => {
      product.title = req.body.title;
      product.imageUrl = req.body.imageUrl;
      product.price = req.body.price;
      product.description = req.body.description;
      return product.save();
    })
    .then(result => {
      console.log('Product Updated');
      res.redirect('/');
    })
    .catch(err => console.log('err', err));
};

exports.postDeleteProduct = (req, res, next) => {
  console.log('productId', req.body.productId);
  Product.findByPk(req.body.productId)
    .then(product => {
      return product.destroy();
    })
    .then(() => {
      console.log('Product Destroyed');
      res.redirect('/admin/product-list');
    })
    .catch(err => console.log(err));
};

exports.postAddProduct = (req, res, next) => {
  const productData = {
    title: req.body.title,
    imageUrl: req.body.imageUrl,
    price: req.body.price,
    description: req.body.description,
  };
  Product.create(productData)
    .then(() => {
      console.log('Product Created');
      res.redirect('/');
    })
    .catch(err => console.log('err', err));
};

exports.getAdminProductList = (req, res, next) => {
  Product.findAll()
    .then(products => {
      res.render('admin/product-list', {
        products: products,
        pageTitle: 'Admin Product List',
        path: '/admin/product-list',
      });
    })
    .catch(err => console.log('err', err));
};
