const express = require('express');
const adminController = require('../controllers/admin');

const router = express.Router();

router.get('/add-product', adminController.getAddProductPage);
router.get('/products', adminController.getProducts)
router.post('/add-product', adminController.postAddProduct);

module.exports = router;