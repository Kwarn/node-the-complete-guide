const fs = require('fs');
const path = require('path');
const rootPath = require('../util/path');
const filePath = path.join(rootPath, 'data', 'products.json');

const dummyData = [
  { title: 'test', imageUrl: '', price: '13.37', description: 'Dummy data' },
];

const getProductsFromFile = cb => {
  fs.readFile(filePath, (err, fileContent) => {
    if (err) cb(dummyData);
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
    getProductsFromFile(products => {
      products.push(this);
      fs.writeFile(filePath, JSON.stringify(products), err => console.log(err));
    });
  }

  static fetchAll(cb) {
    getProductsFromFile(cb);
  }
};
