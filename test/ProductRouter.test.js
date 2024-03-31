const { expect } = require('chai');
const supertest = require('supertest');
const { describe, it, after } = require('mocha');
const mongoose = require('mongoose');

const requester = supertest("http://localhost:3000");

describe("Prueba routers products", async function () {

    this.timeout(5000)

    let agent;

    before(async () => {
        await mongoose.connect('mongodb+srv://I_Ulloa:Coderclave@ecommerce.6tv4mer.mongodb.net/?retryWrites=true&w=majority&dbName=ecommerce');
        agent = supertest.agent("http://localhost:3000");
        await agent.post("/api/sessions/login").send({
            email: 'adminCoder@coder.com',
            password: 'adminCod3r123'
        });
    });

    after(async () => {
        await agent.get("/api/sessions/logout");
    });



    describe("Pruebas endpoints", async function () {

        let productId;

        after(async () => {
            await mongoose.connection.collection("products").deleteOne({ title: "TESTING" });
        })

        it("GET /api/products", async () => {
            const response = await requester.get("/api/products");
            expect(response.status).to.equal(200);
            expect(response.body).to.have.property('payload');
            expect(response.body.payload).to.be.an('array');
        });

        it("POST /api/products", async () => {
            const newProduct = {
                title: "TESTING",
                description: "Test product",
                code: "12345",
                price: 10,
                stock: 100,
                category: "Test Category",
                thumbnails: []
            };
            const response = await agent.post("/api/products").send(newProduct);
            expect(response.status).to.equal(201);
            expect(response.body).to.have.property('message').equal('Producto agregado exitosamente');
            expect(response.body).to.have.property('products').to.be.an('array');
            const product = response.body.products.find(prod => prod.title === "TESTING");
            if (!product) {
                throw new Error('No se pudo encontrar el producto con el título "TESTING" en la respuesta');
            }
            productId = product._id;
        });

        it("GET /api/products/:id (Obtener un producto por ID)", async () => {
            if (!productId) {
                throw new Error('El ID del producto no está definido');
            }

            const response = await requester.get(`/api/products/${productId}`);
            expect(response.status).to.equal(200);
            expect(response.body).to.have.property('product');
            expect(response.body.product).to.have.property('_id', productId);
            expect(response.body.product).to.have.property('title', 'TESTING');
        });

        it("PUT /api/products/:id (Actualizar un producto)", async () => {
            if (!productId) {
                throw new Error('El ID del producto no está definido');
            }
    
            const updatedProduct = {
                description: "Updated test product",
                code: "54321",
                price: 20,
                stock: 200,
                category: "Updated Test Category",
            };
    
            const response = await agent.put(`/api/products/${productId}`).send(updatedProduct);
            
            expect(response.status).to.equal(200);
            expect(response.body).to.have.property('message').equal('Producto actualizado exitosamente');
    
            const updatedProductResponse = await requester.get(`/api/products/${productId}`);
            expect(updatedProductResponse.status).to.equal(200);
            expect(updatedProductResponse.body).to.have.property('product');
            expect(updatedProductResponse.body.product).to.have.property('description', 'Updated test product');
            expect(updatedProductResponse.body.product).to.have.property('code', '54321');
            expect(updatedProductResponse.body.product).to.have.property('price', 20);
            expect(updatedProductResponse.body.product).to.have.property('stock', 200);
            expect(updatedProductResponse.body.product).to.have.property('category', 'Updated Test Category');
        });

        it("DELETE /api/products/:id (Eliminar un producto)", async () => {
            if (!productId) {
                throw new Error('El ID del producto no está definido');
            }
    
            const response = await agent.delete(`/api/products/${productId}`);
            
            expect(response.status).to.equal(200);
            expect(response.body).to.have.property('message').equal('Producto eliminado exitosamente');
    
            const deletedProductResponse = await requester.get(`/api/products/${productId}`);
            expect(deletedProductResponse.status).to.equal(404);
            expect(deletedProductResponse.body).to.have.property('error').equal('Producto no encontrado');
        });

    })


})