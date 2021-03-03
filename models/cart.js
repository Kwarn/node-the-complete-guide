const fs = require('fs');
const path = require('path');
const rootPath = require('../util/path');
const filePath = path.join(rootPath, 'data', 'cart.json');

module.exports = class Cart {
  static getCartSync() {
    return JSON.parse(
      fs.readFileSync(filePath, (err, fileContent) => {
        if (err) console.log('Error Reading Cart: Empty or does not exist');
      })
    );
  }

  static getProductById(cart, id) {
    const existingProductIndex = cart.products.findIndex(p => p.id === id);
    const existingProduct = cart.products[existingProductIndex];
    return [existingProduct, existingProductIndex];
  }

  static writeCartToFile(cart) {
    fs.writeFile(filePath, JSON.stringify(cart), err => {
      console.log(err);
    });
  }

  static updateCart(cart, product, productIndex, productPrice) {
    const updatedCart = { ...cart };
    const updatedProduct = { ...product };
    updatedProduct.qty = product.qty + 1;
    updatedCart.products[productIndex] = updatedProduct;
    updatedCart.totalPrice = updatedCart.totalPrice + +productPrice;
    this.writeCartToFile(updatedCart);
  }

  static addToCart(cart, id, productPrice) {
    const updatedCart = { ...cart };
    updatedCart.products = [...updatedCart.products, { id: id, qty: 1 }];
    updatedCart.totalPrice = updatedCart.totalPrice + +productPrice;
    this.writeCartToFile(updatedCart);
  }

  static addProduct(id, productPrice) {
    const cart = this.getCartSync();
    const [existingProduct, existingProductIndex] = this.getProductById(
      cart,
      id
    );
    if (existingProduct)
      this.updateCart(
        cart,
        existingProduct,
        existingProductIndex,
        productPrice
      );
    else this.addToCart(cart, id, productPrice);
  }

  static deleteProduct(id, price) {
    fs.readFile(filePath, (err, fileContent) => {
      if (err) return;
      console.log('fileContent', fileContent);
      // const products = [...cart.products]
      const updatedPrice = 0;
    });
  }
};
