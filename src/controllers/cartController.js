const CartService = require('../repository/cart.service');
const productService = require('../repository/product.service')
const ticketLogic = require('../dao/ticketDao')

const { Cart } = require('../dao/index');
const CartRouter = require('../routers/CartRouter');

class CartController {
    async createCart(req, res) {
        try {
            const cart = await CartService.createCart();
            res.status(201).json({ cart });
        } catch (error) {
            console.error('Error al crear un carrito:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    }

    async getCartById(req, res) {
        const cid = req.params.cid;
        try {
            const cart = await CartService.getCartById(cid);
            if (cart) {
                res.render('cart', { cart });
                console.log(cart)
            } else {
                res.status(404).json({ error: 'Carrito no encontrado' });
            }
        } catch (error) {
            console.error(`Error al obtener el carrito con ID ${cid}:`, error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    }

    async addProductToCart(req, res) {
        const cid = req.params.cid;
        const { productId, quantity } = req.body;
        const user = req.session.usuario;
    
        try {
            const cart = await CartService.getCartById(cid);
    
            if (!cart) {
                return res.status(404).json({ error: 'Carrito no encontrado' });
            }
    
            const product = await productService.getProductById(productId);
            if (user && user.role === 'premium' && product.owner === user.email) {
                return res.status(403).json({ error: 'No puedes agregar un producto que te pertenece a tu carrito' });
            }
    
            await CartService.addProductToCart(cid, productId, quantity);
    
            const updatedCart = await CartService.getCartById(cid);
            req.io.emit('updateCart', updatedCart);
    
            res.status(201).json({ message: 'Producto agregado al carrito', product, updatedCart });
        } catch (error) {
            console.error(`Error al agregar un producto al carrito con ID ${cid}:`, error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    }


    async deleteProductFromCart(req, res) {
        try {
            const { cid, pid } = req.params;

            const updatedCart = await Cart.findByIdAndUpdate(
                cid,
                { $pull: { products: { _id: pid } } },
                { new: true }
            ).populate('products.product');

            res.status(200).json({
                status: 'success',
                payload: updatedCart.products,
            });
        } catch (error) {
            console.error('Error al eliminar el producto del carrito:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    }

    async updateCart(req, res) {
        try {
            const { cid } = req.params;
            const newProducts = req.body.products;
            console.log(newProducts)

            const updatedCart = await Cart.findByIdAndUpdate(cid, { products: newProducts }, { new: true })
                .populate('products.product');

            res.status(200).json({
                status: 'success',
                payload: updatedCart.products,
            });

            console.log(updatedCart)
        } catch (error) {
            console.error('Error al actualizar el carrito:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    }

    async updateQuantityInCart(req, res) {
        try {
            const { cid, pid } = req.params;
            const { quantity } = req.body;

            const updatedCart = await Cart.findOneAndUpdate(
                { _id: cid, 'products._id': pid },
                { $set: { 'products.$.quantity': quantity } },
                { new: true }
            ).populate('products.product');

            res.status(200).json({
                status: 'success',
                payload: updatedCart.products,
            });
        } catch (error) {
            console.error('Error al actualizar la cantidad del producto en el carrito:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    }

    async deleteAllProductsInCart(req, res) {
        try {
            const { cid } = req.params;

            await Cart.findByIdAndUpdate(cid, { $set: { products: [] } });

            res.status(200).json({
                status: 'success',
                message: 'Todos los productos del carrito han sido eliminados',
            });
        } catch (error) {
            console.error('Error al eliminar todos los productos del carrito:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    }

    async purchaseCart(req, res) {
        const cid = req.params.cid;
        try {
            const cart = await Cart.findById(cid).populate('products.product');
            if (!cart) {
                return res.status(404).json({ error: 'Carrito no encontrado' });
            }
    
            const user = req.session.usuario;
            const purchaserEmail = user ? user.email : 'Unknown';
            let totalAmount = 0;
            const failedProducts = [];
    
            for (const productItem of cart.products) {
                const productId = productItem.product._id;
                const quantity = productItem.quantity;
    
                const product = await productService.getProductById(productId);
                if (!product || product.stock < quantity) {
                    failedProducts.push(productItem);
                } else {
                    totalAmount += product.price * quantity;
                    product.stock -= quantity;
                    await product.save();
                }
            }
    
            const ticket = await ticketLogic.generateTicket(purchaserEmail, totalAmount);
    
            try {
                cart.products = failedProducts;
                await cart.save();
    
                console.log('Ticket generado:', ticket);
    
                if (failedProducts.length === 0) {
                    res.status(200).json({ message: 'Compra completada con éxito. Ticket generado.', ticket });
                } else {
                    res.status(200).json({ message: 'Compra completada con productos no disponibles', failedProducts: failedProducts.map(item => item.product._id), ticket });
                }
            } catch (error) {
                console.error('Error al guardar el carrito actualizado:', error);
                res.status(500).json({ error: 'Error interno del servidor' });
            }
        } catch (error) {
            console.error('Error al finalizar la compra:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    }
}

module.exports = new CartController();
