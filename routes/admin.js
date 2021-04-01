const express = require('express');
const adminController = require('../controllers/admin');
const { route } = require('./shop');

const router = express.Router();

router.get('/add-product', adminController.getAddProductPage);
// router.get('/product-list', adminController.getAdminProductList);
router.post('/add-product', adminController.postAddProduct);
// router.post('/edit-product/:productId', adminController.postEditProduct);
// router.get('/edit-product/:productId', adminController.getEditProductPage)
// router.post('/delete-product', adminController.postDeleteProduct)

module.exports = router;
