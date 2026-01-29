const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const productController = require('../controllers/productController');
const auth = require('../middleware/auth');
const validateRole = require('../middleware/validateRole');
const { ROLES } = require('../config/constants');

router.post(
    '/',
    [
        auth,
        validateRole([ROLES.SUPPLIER]),
        check('name', 'Name is required').not().isEmpty(),
        check('category', 'Category is required').not().isEmpty(),
        check('sku', 'SKU is required').not().isEmpty()
    ],
    productController.createProduct
);

router.get('/', productController.getAllProducts);

router.get('/:id', productController.getProduct);

router.put(
    '/:id',
    [
        auth,
        validateRole([ROLES.SUPPLIER])
    ],
    productController.updateProduct
);

router.delete(
    '/:id',
    [
        auth,
        validateRole([ROLES.SUPPLIER, ROLES.ADMIN])
    ],
    productController.deleteProduct
);

module.exports = router;
