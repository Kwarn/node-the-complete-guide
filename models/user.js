const getDb = require('../util/database').getDb;
const mongodb = require('mongodb');
const Product = require('../models/product');

class User {
  constructor(username, email, cart, id) {
    this.username = username;
    this.email = email;
    this.cart = cart || { items: [] };
    this._id = id;
  }

  save() {
    const db = getDb();
    return db.collection('users').insertOne(this);
  }

  addToCart(product) {
    const cartProductIndex = this.cart.items.findIndex(cp => {
      //productId from mongoDb is technically not a string
      //using .toString here instead of loose comparison ==
      return cp.productId.toString() === product._id.toString();
    });
    const updatedCartItems = [...this.cart.items];

    let newQty = 1;
    if (cartProductIndex >= 0) {
      newQty = this.cart.items[cartProductIndex].qty + 1;
      updatedCartItems[cartProductIndex].qty = newQty;
    } else {
      updatedCartItems.push({
        productId: new mongodb.ObjectId(product._id),
        qty: newQty,
      });
    }
    const updatedCart = {
      items: updatedCartItems,
    };

    const db = getDb();
    return db
      .collection('users')
      .updateOne(
        { _id: new mongodb.ObjectId(this._id) },
        { $set: { cart: updatedCart } }
      );
  }

  getCart() {
    const db = getDb();
    const productIds = this.cart.items.map(product => product.productId);
    return db
      .collection('products')
      .find({ _id: { $in: productIds } })
      .toArray()
      .then(products => {
        return products.map(p => {
          return {
            ...p,
            qty: this.cart.items.find(
              i => i.productId.toString() === p._id.toString()
            ).qty,
          };
        });
      })
      .catch(err => console.log('Get Cart Error', err));
  }

  static findById(userId) {
    const db = getDb();
    return db
      .collection('users')
      .findOne({ _id: new mongodb.ObjectId(userId) });
  }
}

module.exports = User;
