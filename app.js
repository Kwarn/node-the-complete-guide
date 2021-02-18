const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const errorController = require('./controllers/error')
const rootDir = require('./util/path');

const app = express();
app.set('view engine', 'ejs');

// this is the default anyway
app.set('views', 'views');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(rootDir, 'public')));
app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(errorController.getError404Page);

app.listen(5000);
