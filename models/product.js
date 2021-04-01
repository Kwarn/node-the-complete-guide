const getDb = require('../util/database').getDb;

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
}

module.exports = Product;
