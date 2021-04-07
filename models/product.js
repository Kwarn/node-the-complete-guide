const getDb = require('../util/database').getDb;
const mongodb = require('mongodb');
class Product {
  constructor(title, imageUrl, price, description, id) {
    this.title = title;
    this.price = price;
    this.description = description;
    this.imageUrl = imageUrl;
    this._id = id ? mongodb.ObjectId(id) : null;
  }
  save() {
    const db = getDb();
    let dbOp;
    if (this._id) {
      dbOp = db
        .collection('products')
        .updateOne({ _id: this._id }, { $set: this });
    } else {
      dbOp = db.collection('products').insertOne(this);
    }
    return dbOp
      .then(result => console.log(`result dbOp`, result))
      .catch(err => console.log(`dbOp err`, err));
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

  static deleteById(productId) {
    const db = getDb();
    return db
      .collection('products')
      .deleteOne({ _id: new mongodb.ObjectId(productId) })
      .catch(err => console.log(`deleteOne err`, err));
  }
}

module.exports = Product;
