const getDb = require('../util/database').getDb;
const mongodb = require('mongodb');
class Product {
  constructor(title, imageUrl, price, description) {
    this.title = title;
    this.price = price;
    this.description = description;
    this.imageUrl = imageUrl;
  }
  save() {
    const db = getDb();
    return db.collection('products').insertOne(this);
  }

  static fetchAll() {
    const db = getDb();
    return db
      .collection('products')
      .find()
      .toArray()
      .then(products => {
        console.log(`products`, products);
        return products;
      })
      .catch(err => console.log(`err`, err));
  }

  static findById(productId) {
    const db = getDb();
    return db
      .collection('products')
      .find({ _id: mongodb.ObjectId(productId) })
      .next()
      .then(product => {
        console.log(product);
        return product;
      })
      .catch(err => console.log(`err`, err));
  }
}

module.exports = Product;
