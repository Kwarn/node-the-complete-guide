const Product = require('../models/product');

const express = require('express');
const router = express.Router();

exports.getAddProductPage = (req, res, next) => {
  res.render('admin/add-product', {
    pageTitle: 'Add Products',
    path: '/admin/add-product',
  });
};

exports.postAddProduct = router.post('/add-product', (req, res, next) => {
  const productData = {
    title: req.body.title,
    imageUrl: req.body.imageUrl,
    price: req.body.price,
    description: req.body.description,
  };
  const product = new Product(productData);
  product.save();
  res.redirect('/');
});

exports.getAdminProductList = (req, res, next) => {
  Product.fetchAll(products =>
    res.render('admin/product-list', {
      products: products,
      pageTitle: 'Admin Product List',
      path: '/admin/product-list',
    })
  );
};
