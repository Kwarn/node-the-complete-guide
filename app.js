const path = require('path');
const express = require('express');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');
const bodyParser = require('body-parser');
const errorController = require('./controllers/error');
const rootDir = require('./util/path');
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');
const User = require('./models/user');
const mongoose = require('mongoose');
const user = require('./models/user');
const MONGODB_URI =
  'mongodb+srv://user1:l99vRGo3WaPuTcZ8@cluster0.4nmcs.mongodb.net/shop';

const app = express();
const store = new MongoDBStore({ uri: MONGODB_URI, collection: 'sessions' });
app.set('view engine', 'ejs');
app.set('views', 'views');

const csrfProtection = csrf();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(
  session({
    secret: 'should be a long string',
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);

app.use(csrfProtection);
app.use(flash());

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then(user => {
      if (!user) return next();
      req.user = user;
      next();
    })
    .catch(err => {
      throw new Error(err);
    });
});
app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.user;
  res.locals.csrfToken = req.csrfToken();
  next();
});
app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);
app.get('/500', errorController.getError500Page);
app.use(errorController.getError404Page);

mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then(result => {
    // User.findOne().then(user => {
    //   if (!user) {
    //     const user = new User({
    //       name: 'Karl',
    //       email: 'k@w.dev',
    //       cart: { items: [] },
    //     });
    //     user.save();
    //   }
    // });
    console.log('Mongoose Connected To MongoDB');
    app.listen(3000);
  })
  .catch(err => console.log(`Mongoose Connect Error`, err));
