const cartDao = require('../dao/cartDao');

class CartService {
    async getCarts() {
        return await cartDao.getCarts();
    }

    async createCart() {
        return await cartDao.createCart();
    }

    async addProductToCart(cartId, productId, quantity) {
        return await cartDao.addProductToCart(cartId, productId, quantity);
    }

    async getCartById(id) {
        return await cartDao.getCartById(id);
    }


}

module.exports = new CartService();