const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const errorController = require('./controllers/error');
const rootDir = require('./util/path');
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const User = require('./models/user');
const mongoose = require('mongoose');
const user = require('./models/user');

const app = express();
app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use((req, res, next) => {
  User.findById('6076a37601d5191d4ff2fb69')
    .then(user => {
      req.user = user;
      next();
    })
    .catch(err => console.log(`Error`, err));
});
app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(errorController.getError404Page);

mongoose
  .connect(
    'mongodb+srv://user1:l99vRGo3WaPuTcZ8@cluster0.4nmcs.mongodb.net/shop?retryWrites=true&w=majority',
    { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false }
  )
  .then(result => {
    User.findOne().then(user => {
      if (!user) {
        const user = new User({
          name: 'Karl',
          email: 'k@w.dev',
          cart: { items: [] },
        });
        user.save();
      }
    });
    console.log('Mongoose Connected To MongoDB');
    app.listen(3000);
  })
  .catch(err => console.log(`Mongoose Connect Error`, err));
