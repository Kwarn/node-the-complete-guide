const fs = require('fs');
const path = require('path');
const rootPath = require('../util/path');
const Product = require('./product');
const filePath = path.join(rootPath, 'data', 'cart.json');

module.exports = class Cart {
  static addProduct(id, productPrice) {
    fs.readFile(filePath, (err, fileContent) => {
      let cart = { products: [], totalPrice: 0 };
      if (!err) {
        const existingCart = JSON.parse(fileContent);
        console.log(existingCart)
        if (existingCart) {
          cart = JSON.parse(fileContent);
        }
      }
      // find existing items in cart
      const existingProductIndex = cart.products.findIndex(p => p.id === id);
      const existingProduct = cart.products[existingProductIndex];
      let updatedProduct;

      // update existing products array with updated product, incrementing Qty
      if (existingProduct) {
        updatedProduct = { ...existingProduct };
        updatedProduct.qty = existingProduct.qty + 1;
        cart.products = [...cart.products, updatedProduct];
        cart.products[existingProductIndex] = updatedProduct;
        // add new product to products array
      } else {
        updatedProduct = { id: id, qty: 1 };
        cart.products = [...cart.products, updatedProduct];
      }
      cart.totalPrice = cart.totalPrice + +productPrice;
      fs.writeFile(filePath, JSON.stringify(cart), err => {
        console.log(err);
      });
    });
  }
};
