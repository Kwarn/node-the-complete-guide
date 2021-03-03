const fs = require('fs');
const path = require('path');
const rootPath = require('../util/path');
const filePath = path.join(rootPath, 'data', 'products.json');

const dummyData = [
  {
    id: null,
    title: 'test',
    imageUrl: '',
    price: '13.37',
    description: 'Dummy data',
  },
];

const getProductsFromFile = cb => {
  fs.readFile(filePath, (err, fileContent) => {
    if (err) cb([]);
    else cb(JSON.parse(fileContent));
  });
};

const writeProductsToFile = products => {
  fs.writeFile(filePath, JSON.stringify(products), err => {
    console.dir(err);
  });
};

module.exports = class Product {
  constructor({ id, title, imageUrl, price, description }) {
    this.id = id;
    this.title = title;
    this.imageUrl = imageUrl;
    this.price = price;
    this.description = description;
  }
  save() {
    getProductsFromFile(products => {
      const updatedProducts = [...products];
      if (this.id) {
        const existingProductIdx = products.findIndex(p => p.id === this.id);
        updatedProducts[existingProductIdx] = this;
      } else {
        this.id = Math.random().toString();
        updatedProducts.push(this);
      }
      writeProductsToFile(updatedProducts);
    });
  }

  static deleteProduct(id, cb) {
    getProductsFromFile(products => {
      const updatedProducts = [...products].filter(
        product => product.id !== id
      );
      writeProductsToFile(updatedProducts);
    });
    cb();
  }

  static fetchAll(cb) {
    getProductsFromFile(cb);
  }

  static findById(productId, cb) {
    return getProductsFromFile(products => {
      const product = products.find(p => p.id === productId);
      if (cb) {
        cb(product);
      }
      return product
    });
  }
};
