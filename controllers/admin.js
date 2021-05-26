const Product = require('../models/product');
const mongodb = require('mongodb');
const express = require('express');
const { deleteLocalFile } = require('../util/file');
const { uploadFile, awsDeleteFile } = require('../s3');
const router = express.Router();
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');
const fileHelper = require('../util/file');

const createError = (error, next) => {
  const _error = new Error(error);
  _error.httpStatusCode = 500;
  return next(_error);
};

const uploadHelper = file => {
  return uploadFile(file)
    .then(resData => {
      return resData;
    })
    .catch(err => new Error(err));
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

exports.postAddProduct = async (req, res, next) => {
  const title = req.body.title;
  const image = req.file;
  const price = req.body.price;
  const description = req.body.description;

  if (!image) {
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Add Product',
      path: '/admin/edit-product',
      editing: false,
      previousValues: {
        title: title,
        price: price,
        description: description,
      },
      errorMessage:
        'Attached file is not an image. Supported types are .png .jpg & .jpeg',
      validationErrors: [],
    });
  }

  const errors = validationResult(req).errors;
  if (errors.length > 0) {
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Add Product',
      path: '/admin/edit-product',
      editing: false,
      previousValues: {
        title: title,
        price: price,
        description: description,
      },
      errorMessage: errors[0].msg,
      validationErrors: errors,
    });
  }

  try {
    const awsReponseData = await uploadHelper(image);
    const localImagePath = image.path;
    const product = new Product({
      title: title,
      price: price,
      imageUrl: awsReponseData.Location,
      awsImageKey: awsReponseData.Key,
      description: description,
      userId: req.session.user,
    });
    await product.save();
    await deleteLocalFile(localImagePath);
    return res.redirect('/admin/product-list');
  } catch (err) {
    throw new Error(err);
  }
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
    .catch(err => createError(err, next));
};

exports.postEditProduct = async (req, res, next) => {
  const title = req.body.title;
  const image = req.file;
  const price = req.body.price;
  const description = req.body.description;
  const productId = req.body.productId;
  const errors = validationResult(req).errors;
  if (errors.length > 0) {
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Edit Product',
      path: '/admin/edit-product',
      editing: true,
      product: {
        _id: productId,
        title: title,
        price: price,
        description: description,
      },
      errorMessage: errors[0].msg,
      validationErrors: errors,
    });
  }
  try {
    const product = await Product.findById(productId);
    if (product.userId.toString() !== req.user._id.toString())
      return res.redirect('/');
    product.title = title;
    product.price = price;
    product.description = description;
    if (image) {
      const awsReponseData = await uploadHelper(image);
      await awsDeleteFile(product.awsImageKey);
      product.awsImageKey = awsReponseData.Key;
      product.imageUrl = awsReponseData.Location;
      await deleteLocalFile(image.path);
    } else {
      product.awsImageKey = product.awsImageKey;
      product.imageUrl = product.imageUrl;
    }
    await product.save();
    return res.redirect('/admin/product-list');
  } catch (err) {
    throw new Error(err);
  }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.productId);
    if (!product) {
      throw new Error('Product not found.');
    }
    const awsImageKey = product.awsImageKey;
    await Product.findByIdAndRemove(req.params.productId);
    await awsDeleteFile(awsImageKey);
    res.status(200).json({ message: 'Success!' });
  } catch (err) {
    throw new Error(err);
  }
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
    .catch(err => createError(err, next));
};
