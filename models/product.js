const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const productSchema = new Schema({
  title: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String, required: true },
  imageUrl: { type: String, required: true },
  awsImageKey: { type: String, require: true },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
});

module.exports = mongoose.model('Product', productSchema);

// const getDb = require('../util/database').getDb;
// const mongodb = require('mongodb');
// class Product {
//   constructor(title, imageUrl, price, description, id, userId) {
//     this.title = title;
//     this.imageUrl = imageUrl;
//     this.price = price;
//     this.description = description;
//     this._id = id ? mongodb.ObjectId(id) : null;
//     this.userId = userId;
//   }
//   save() {
//     const db = getDb();
//     let dbOp;
//     if (this._id) {
//       dbOp = db
//         .collection('products')
//         .updateOne({ _id: this._id }, { $set: this });
//     } else {
//       dbOp = db.collection('products').insertOne(this);
//     }
//     return dbOp
//       .then(result => console.log(`result dbOp`, result))
//       .catch(err => console.log(`dbOp err`, err));
//   }

//   static fetchAll() {
//     const db = getDb();
//     return db
//       .collection('products')
//       .find()
//       .toArray()
//       .then(products => {
//         return products;
//       })
//       .catch(err => console.log(`err`, err));
//   }

//   static findById(productId) {
//     const db = getDb();
//     return db
//       .collection('products')
//       .find({ _id: mongodb.ObjectId(productId) })
//       .next()
//       .then(product => {
//         return product;
//       })
//       .catch(err => console.log(`err`, err));
//   }

//   static deleteById(productId) {
//     const db = getDb();
//     return db
//       .collection('products')
//       .deleteOne({ _id: new mongodb.ObjectId(productId) })
//       .catch(err => console.log(`deleteOne err`, err));
//   }
// }

// module.exports = Product;
