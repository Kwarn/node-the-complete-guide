const path = require('path');

const express = require('express');
const shopController = require('../controllers/shop');
const router = express.Router();

router.get('/', shopController.getIndex);
router.get('/products', shopController.getProducts);
router.get('/cart', shopController.getCartPage);
router.get('/checkout', shopController.getCheckoutPage);
router.get('/orders', shopController.getOrdersPage);

module.exports = router;
