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

  getCleanCart() {
    //removes Invalid Product ID's from database and returns mongodb.ObjectID array of valid IDs
    return Product.fetchAll()
      .then(products => products.map(product => product._id.toString()))
      .then(strProductIds => {
        const strCartProductIds = this.cart.items.map(product =>
          product.productId.toString()
        );
        const strInvalidProductIds = strCartProductIds.filter(
          id => !strProductIds.includes(id)
        );
        const strValidProductIds = strCartProductIds.filter(id =>
          strProductIds.includes(id)
        );
        const idsToDelete = strInvalidProductIds.map(
          id => new mongodb.ObjectId(id)
        );

        idsToDelete.forEach(id => this.removeFromCart(id));

        return strValidProductIds.map(id => new mongodb.ObjectId(id));
      });
  }

  getCart() {
    console.log(this);
    const db = getDb();
    return this.getCleanCart().then(validCartProductIds => {
      let cartProductIds = this.cart.items.map(product => product.productId);
      return db
        .collection('products')
        .find({ _id: { $in: validCartProductIds } })
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
    });
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

  removeFromCart(productId) {
    const db = getDb();
    //remove from users cart
    const updatedCartItems = this.cart.items.filter(
      product => product.productId.toString() !== productId.toString()
    );
    //remove from db
    return db
      .collection('users')
      .updateOne(
        { _id: new mongodb.ObjectId(this._id) },
        { $set: { cart: { items: updatedCartItems } } }
      )
      .then(result => console.log('Product Removed From Cart'));
  }

  getOrders() {
    const db = getDb();
    return db
      .collection('orders')
      .find({ 'user._id': new mongodb.ObjectId(this._id) })
      .toArray();
  }

  addOrder() {
    const db = getDb();
    return this.getCart()
      .then(products => {
        const order = {
          items: products,
          user: {
            _id: new mongodb.ObjectId(this._id),
            name: this.name,
            email: this.email,
          },
        };
        return db.collection('orders').insertOne(order);
      })
      .then(result => {
        this.cart = { items: [] };
        return db
          .collection('users')
          .updateOne(
            { _id: new mongodb.ObjectId(this._id) },
            { $set: { cart: { items: [] } } }
          );
      });
  }

  static findById(userId) {
    const db = getDb();
    return db
      .collection('users')
      .findOne({ _id: new mongodb.ObjectId(userId) });
  }
}

module.exports = User;
