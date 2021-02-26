const fs = require('fs');
const path = require('path');
const rootPath = require('../util/path');
const filePath = path.join(rootPath, 'data', 'products.json');

const dummyData = [
  { title: 'test', imageUrl: '', price: '13.37', description: 'Dummy data' },
];

const getProductsFromFile = cb => {
  fs.readFile(filePath, (err, fileContent) => {
    if (err) cb([]);
    else cb(JSON.parse(fileContent));
  });
};

module.exports = class Product {
  constructor({ title, imageUrl, price, description }) {
    this.title = title;
    this.imageUrl = imageUrl;
    this.price = price;
    this.description = description;
  }
  save() {
    this.id = Math.random().toString();
    getProductsFromFile(products => {
      products.push(this);
      fs.writeFile(filePath, JSON.stringify(products), err => {
        console.dir(err);
      });
    });
  }

  static fetchAll(cb) {
    getProductsFromFile(cb);
  }

  static findById(productId, cb) {
    getProductsFromFile(products => {
      const product = products.find(p => p.id === productId);
      cb(product);
    });
  }
};
