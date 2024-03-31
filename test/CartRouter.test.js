const { expect } = require('chai');
const supertest = require('supertest');
const { describe, it, after } = require('mocha');
const mongoose = require('mongoose');
const CartService = require('../src/repository/cart.service');

const requester = supertest("http://localhost:3000");

describe("Prueba routers cart", async function () {

    this.timeout(5000)

    let agent;

    before(async () => {
        await mongoose.connect('mongodb+srv://I_Ulloa:Coderclave@ecommerce.6tv4mer.mongodb.net/?retryWrites=true&w=majority&dbName=ecommerce');
        agent = supertest.agent("http://localhost:3000");
        await agent.post("/api/sessions/login").send({
            email: 'dgmnicolas@gmail.com',
            password: '123'
        });
    });

    after(async () => {
        await agent.get("/api/sessions/logout");

    });

    describe("Pruebas endpoints", async function () {

        let cartId;
        let cartProductid;
        let cartProductid2;

        after(async () => {
            if (cartId) {
                try {
                    
                    const cartObjectId = new mongoose.Types.ObjectId(cartId);
                    await mongoose.connection.collection("carts").deleteOne({ _id: cartObjectId });
                } catch (error) {
                    console.error(`Error al eliminar el carrito con ID ${cartId}:`, error);
                }
            }
        });


        it("POST /api/carts", async () => {
            const response = await agent.post("/api/carts");
            expect(response.status).to.equal(201);
            expect(response.body).to.have.property('cart');
            expect(response.body.cart).to.have.property('_id');
            cartId = response.body.cart._id;
            console.log(cartId)
        });

        it("GET /api/carts/:cid", async () => {
            if (!cartId) {
                throw new Error('El ID del carrito no está definido');
            }

            const response = await agent.get(`/api/carts/${cartId}`);
            expect(response.status).to.equal(200);
            expect(response.header['content-type']).to.include('text/html');

        });

        it("POST /api/carts/:cid/products", async () => {
            const productId1 = "6585ae81fcb39ade17d125cc"; 
            const productId2 = "6585b0650f8681eb5beb94f4"; 
            const productToAdd1 = {
                productId: productId1,
                quantity: 1
            };
            const productToAdd2 = {
                productId: productId2,
                quantity: 3
            };

            const response1 = await agent.post(`/api/carts/${cartId}/products`).send(productToAdd1);
            expect(response1.status).to.equal(201);
            expect(response1.body).to.have.property('message').equal('Producto agregado al carrito');
            expect(response1.body).to.have.property('product');
            expect(response1.body).to.have.property('updatedCart');
            expect(response1.body.updatedCart).to.have.property('products')
            expect(response1.body.updatedCart.products).to.be.an('array')
            cartProductid = response1.body.updatedCart.products[0]._id;

            const response2 = await agent.post(`/api/carts/${cartId}/products`).send(productToAdd2);
            expect(response2.status).to.equal(201);
            expect(response2.body).to.have.property('message').equal('Producto agregado al carrito');
            expect(response2.body).to.have.property('product');
            expect(response1.body).to.have.property('updatedCart');
            expect(response2.body.updatedCart.products).to.be.an('array')
            cartProductid2 = response2.body.updatedCart.products[1]._id;
        });

        it("DELETE /api/carts/:cid/products/:pid", async () => {
            const productIdToDelete = cartProductid;
        
            const response = await agent.delete(`/api/carts/${cartId}/products/${productIdToDelete}`);
        
            expect(response.status).to.equal(200);
            expect(response.body).to.have.property('status', 'success');
            expect(response.body.payload).to.have.lengthOf(1);

            const updatedCart = await CartService.getCartById(cartId);
            const deletedProduct = updatedCart.products.find(product => product._id === productIdToDelete);
            expect(deletedProduct).to.be.undefined;

        });

        it("PUT /api/carts/:cid/products/:pid", async () => {
            const newQuantity = 5;

            const response = await agent.put(`/api/carts/${cartId}/products/${cartProductid2}`).send({ quantity: newQuantity })
            expect(response.status).to.equal(200);
            expect(response.body).to.have.property('status', 'success');
            expect(response.body).to.have.property('payload');
            expect(response.body.payload).to.be.an('array');
            const updatedProduct = response.body.payload.find(product => product._id === cartProductid2);
            expect(updatedProduct).to.exist;
        
            expect(updatedProduct.quantity).to.equal(newQuantity);
        });

        it("DELETE /api/carts/:cid", async () => {
            const response = await agent.delete(`/api/carts/${cartId}`);
            expect(response.status).to.equal(200);
            expect(response.body).to.have.property('status', 'success');
            expect(response.body).to.have.property('message', 'Todos los productos del carrito han sido eliminados');
            
        });

        it("PUT /api/carts/:cid", async () => {
            const newProducts = [
                { product: "6585ae81fcb39ade17d125cc", quantity: 2 },
                { product: "6585b0650f8681eb5beb94f4", quantity: 3 }
            ];
            const response = await agent.put(`/api/carts/${cartId}`).send({ products: newProducts });
            expect(response.status).to.equal(200);
            expect(response.body).to.have.property('status', 'success');
            expect(response.body).to.have.property('payload');
            expect(response.body.payload).to.be.an('array');
            expect(response.body.payload).to.have.lengthOf(newProducts.length);
        });

        it("POST /api/carts/:cid/purchase", async () => {
            const response = await agent.post(`/api/carts/${cartId}/purchase`);
            expect(response.status).to.equal(200);
            expect(response.body).to.have.property('message');
            expect(response.body.message).to.be.a('string');
            expect(response.body.message).to.contain('Compra completada con éxito');
        
            expect(response.body).to.have.property('ticket');
            expect(response.body.ticket).to.be.an('object');
            expect(response.body.ticket).to.have.property('code');
            expect(response.body.ticket).to.have.property('amount').that.is.equal(6754);
        });



    })

})