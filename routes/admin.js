const express = require('express');
const adminController = require('../controllers/admin');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get('/add-product', isAuth, adminController.getAddProductPage);
router.get('/product-list', isAuth, adminController.getAdminProductList);
router.post('/add-product', isAuth, adminController.postAddProduct);
router.post('/edit-product', isAuth, adminController.postEditProduct);
router.get(
  '/edit-product/:productId',
  isAuth,
  adminController.getEditProductPage
);
router.post('/delete-product', isAuth, adminController.postDeleteProduct);

module.exports = router;
