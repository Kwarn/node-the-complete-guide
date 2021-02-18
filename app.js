const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const rootDir = require('./util/path');
// const exphbs = require('express-handlebars');

const app = express();
// app.engine(
//   'hbs',
//   exphbs({
//     layoutsDir: 'views/layouts/',
//     defaultLayout: 'main-layout',
//     extname: 'hbs',
//   })
// );
app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(rootDir, 'public')));
app.use('/admin', adminRoutes.routes);
app.use(shopRoutes.routes);
app.use((req, res, next) => {
  res.status(404).render('404', { pageTitle: '404 Error: Page Not Found' });
});

app.listen(5501);
