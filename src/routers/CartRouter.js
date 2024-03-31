const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { redirectToHomeIfAdmin, } = require('../middleware/authorization');


module.exports = function (io) {
    router.post('/', cartController.createCart);
    router.get('/:cid', cartController.getCartById);
    router.post('/:cid/products', redirectToHomeIfAdmin,  cartController.addProductToCart);
    router.delete('/:cid/products/:pid', redirectToHomeIfAdmin,  cartController.deleteProductFromCart);
    router.put('/:cid', cartController.updateCart);
    router.put('/:cid/products/:pid',  cartController.updateQuantityInCart);
    router.delete('/:cid',  cartController.deleteAllProductsInCart);
    router.post('/:cid/purchase', redirectToHomeIfAdmin, cartController.purchaseCart);
    
    return router;
}
