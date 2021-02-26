const express = require('express');
const adminController = require('../controllers/admin');

const router = express.Router();

router.get('/add-product', adminController.getAddProductPage);
router.get('/product-list', adminController.getAdminProductList);
router.post('/add-product', adminController.postAddProduct);
router.get('/edit-product/:productId', adminController.getEditProductPage)

module.exports = router;
