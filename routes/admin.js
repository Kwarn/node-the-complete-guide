const express = require('express');
const adminController = require('../controllers/admin');
const isAuth = require('../middleware/is-auth');
const { check, body } = require('express-validator');

const router = express.Router();

router.get('/add-product', isAuth, adminController.getAddProductPage);
router.get('/product-list', isAuth, adminController.getAdminProductList);
router.post(
  '/add-product',
  isAuth,
  [
    check(
      'title',
      'Titles may only contain letters & numbers and must have a minimum length of 3.'
    )
      .isString()
      .isLength({ min: 3 })
      .trim(),
    check('imageUrl', 'Invalid Image URL.').isURL(),
    check(
      'price',
      'Invalid Price - Please use the format 00.00 excluding any currency symbol'
    ).isFloat(),
    check(
      'description',
      'Description may only contain letters & numbers and must have a minimum length of 3.'
    )
      .isLength({ min: 5, max: 400 })
      .trim(),
  ],
  adminController.postAddProduct
);
router.post(
  '/edit-product',
  isAuth,
  [
    check(
      'title',
      'Titles may only contain letters & numbers and must have a minimum length of 3.'
    )
      .isString()
      .isLength({ min: 3 })
      .trim(),
    check('imageUrl', 'Invalid Image URL.').isURL(),
    check(
      'price',
      'Invalid Price - Please use the format 00.00 excluding any currency symbol'
    ).isFloat(),
    check(
      'description',
      'Description may only contain letters & numbers and must have a minimum length of 3.'
    )
      .isLength({ min: 5, max: 400 })
      .trim(),
  ],
  adminController.postEditProduct
);
router.get(
  '/edit-product/:productId',
  isAuth,
  adminController.getEditProductPage
);
router.post('/delete-product', isAuth, adminController.postDeleteProduct);

module.exports = router;
