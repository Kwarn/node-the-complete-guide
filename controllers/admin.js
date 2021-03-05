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
  Product.findById(productId, product => {
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
  });
};

exports.postEditProduct = (req, res, next) => {
  const productData = {
    id: req.params.productId,
    title: req.body.title,
    imageUrl: req.body.imageUrl,
    price: req.body.price,
    description: req.body.description,
  };
  const product = new Product(productData);
  product.save();
  res.redirect('/admin/product-list');
};

exports.postDeleteProduct = (req, res, next) => {
  Product.deleteProduct(req.params.productId, () => {
    res.redirect('/admin/product-list');
  });
};

exports.postAddProduct = (req, res, next) => {
  const productData = {
    id: null,
    title: req.body.title,
    imageUrl: req.body.imageUrl,
    price: req.body.price,
    description: req.body.description,
  };
  const product = new Product(productData);
  product
    .save()
    .then(() => res.redirect('/products'))
    .catch();
};

exports.getAdminProductList = (req, res, next) => {
  Product.fetchAll(products =>
    res.render('admin/product-list', {
      products: products,
      pageTitle: 'Admin Product List',
      path: '/admin/product-list',
    })
  );
};
