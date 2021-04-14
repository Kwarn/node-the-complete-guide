const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const errorController = require('./controllers/error');
const rootDir = require('./util/path');
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const User = require('./models/user');
const mongoose = require('mongoose');

const app = express();
app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
// app.use((req, res, next) => {
//   // User.findById('606eb6978dc1bc25402a680b')
//   //   .then(user => {
//   //     req.user = new User(user.name, user.email, user.cart, user._id);
//   //     next();
//   //   })
//   //   .catch(err => console.log(`Error`, err));
//   next()
// });
app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(errorController.getError404Page);

mongoose
  .connect(
    'mongodb+srv://user1:l99vRGo3WaPuTcZ8@cluster0.4nmcs.mongodb.net/shop?retryWrites=true&w=majority',
    { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false }
  )
  .then(result => {
    console.log('Mongoose Connected To MongoDB');
    app.listen(3000);
  })
  .catch(err => console.log(`Mongoose Connect Error`, err));

// mongoConnect((client, db) => {
//   // Create user if no users exist
//   db.collection('users')
//     .countDocuments()
//     .then(count => {
//       if (count === 0) {
//         const user = new User('karl', 'k@w.com');
//         user.save().then(result => console.log('Default User Created'));
//       }
//     });

//   app.listen(3000);
// });
