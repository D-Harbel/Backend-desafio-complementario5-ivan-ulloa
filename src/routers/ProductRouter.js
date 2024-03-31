const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { isAdminOrPremium } = require('../middleware/authorization');

module.exports = function (io) {
    router.get('/', productController.getProducts);
    router.post('/', isAdminOrPremium, productController.addProduct);
    router.put('/:id', isAdminOrPremium, productController.updateProduct);
    router.get('/:id', productController.getProductById);
    router.delete('/:id', isAdminOrPremium,  productController.deleteProduct);

    return router;
}
