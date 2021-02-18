const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const rootDir = require('./util/path');

const app = express();
app.set('view engine', 'ejs');

// this is the default anyway
app.set('views', 'views');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(rootDir, 'public')));
app.use('/admin', adminRoutes.routes);
app.use(shopRoutes.routes);
app.use((req, res, next) => {
  res
    .status(404)
    .render('404', { pageTitle: '404 Error: Page Not Found', path: '' });
});

app.listen(5501);
