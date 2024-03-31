const fs = require('fs');

class CartManager {
    constructor(path) {
        this.path = path;
    }

    getCarts() {
        if (fs.existsSync(this.path)) {
            return JSON.parse(fs.readFileSync(this.path, "utf-8"));
        } else {
            return [];
        }
    }

    createCart() {
        let carts = this.getCarts();

        let id = Date.now().toString();

        let cart = {
            id,
            products: []
        };

        carts.push(cart);

        fs.writeFileSync(this.path, JSON.stringify(carts, null, 5));
        return cart;
    }

    addProductCart(cartId, productId, quantity) {
        let carts = this.getCarts();
        let products = this.pm.getProducts()

        let productExists = products.some(product => product.id === productId);

        if (!productExists) {
            console.log(`No se encontró el producto con el ID ${productId}`);
            return;
        }

        let index = carts.findIndex(cart => cart.id === cartId.toString())

        if (index === -1) {
            console.log(`No se ha encontrado ${cartId}`);
            return;
        }

        let product = {
            product: productId,
            quantity: quantity
        };

        let cart = carts[index];
        cart.products.push(product);

        fs.writeFileSync(this.path, JSON.stringify(carts, null, 5));
    }

    getCartById(id) {
        let carts = this.getCarts();
    
        let index = carts.findIndex(cart => cart.id.toString() === id.toString());
    
        if (index === -1) {
            console.log(`Not found ${id}`);
            return;
        }
    
        return carts[index];
    }
    
}

const cm = new CartManager("./JSON/carrito.json");

module.exports = CartManager;