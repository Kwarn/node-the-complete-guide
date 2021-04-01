const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

let _db;

const mongoConnect = callback => {
  MongoClient.connect(
    'mongodb+srv://user1:l99vRGo3WaPuTcZ8@cluster0.4nmcs.mongodb.net/shop?retryWrites=true&w=majority',
    { useUnifiedTopology: true }
  )
    .then(client => {
      console.log('Connected');
      _db = client.db();
      callback(client, _db);
    })
    .catch(error => console.log(`MongoDB Connection Error: `, error));
};

const getDb = () => {
  if (_db) {
    // console.log('DATABASE: ', _db);
    return _db;
  }
  throw new Error('No Databse Found');
};

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;
