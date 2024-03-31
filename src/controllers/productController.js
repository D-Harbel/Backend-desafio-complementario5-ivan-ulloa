const ProductService = require('../repository/product.service');
const { Product } = require('../dao/index');
const { CustomError } = require('../utils/CustomErrors');
const { ErrorCodes } = require('../utils/errors');
const { STATUS_CODES, ERRORES_INTERNOS } = require('../utils/ErrorTypes');

class ProductController {
    async getProducts(req, res) {
        try {
            const { limit, page, sort, query } = req.query;
            const options = {
                page: parseInt(page),
                limit: parseInt(limit),
                sort: sort ? { price: sort === 'asc' ? 1 : -1 } : undefined,
            };

            const filter = query ? {} : {};

            if (!limit) {
                delete options.limit;
            }

            const products = await Product.paginate(filter, options);

            const totalPages = products.totalPages;
            const prevPage = products.prevPage;
            const nextPage = products.nextPage;
            const hasPrevPage = products.hasPrevPage;
            const hasNextPage = products.hasNextPage;
            const prevLink = hasPrevPage ? `/products?limit=${limit}&page=${prevPage}` : null;
            const nextLink = hasNextPage ? `/products?limit=${limit}&page=${nextPage}` : null;

            res.json({
                status: 'success',
                payload: products.docs,
                totalPages,
                prevPage,
                nextPage,
                page: products.page,
                hasPrevPage,
                hasNextPage,
                prevLink,
                nextLink,
                limit
            });
        } catch (error) {
            console.error('Error al obtener productos:', error);
            res.status(500).json({ status: 'error', error: 'Error interno del servidor' });
        }
    }

    async addProduct(req, res) {
        const { title, description, code, price, stock, category, thumbnails } = req.body;

        try {
            if (typeof title !== 'string' || title.trim() === '') {
                throw new CustomError(
                    ErrorCodes.Campo_Vacio.name,
                    ErrorCodes.title.message,
                    STATUS_CODES.ERROR_ARGUMENTOS,

                );
            }

            if (typeof description !== 'string' || description.trim() === '') {
                throw new CustomError(
                    ErrorCodes.Campo_Vacio.name,
                    ErrorCodes.description.message,
                    STATUS_CODES.ERROR_ARGUMENTOS,
                );
            }

            if (typeof code !== 'string' || code.trim() === '') {
                throw new CustomError(
                    ErrorCodes.Campo_Vacio.name,
                    ErrorCodes.code.message,
                    STATUS_CODES.ERROR_ARGUMENTOS,
                );
            }

            if (typeof price !== 'number' || isNaN(price) || price <= 0) {
                throw new CustomError(
                    ErrorCodes.Numeros.name,
                    ErrorCodes.price.message,
                    STATUS_CODES.ERROR_ARGUMENTOS,
                );
            }

            if (typeof stock !== 'number' || isNaN(stock) || stock < 0) {
                throw new CustomError(
                    ErrorCodes.Numeros.name,
                    ErrorCodes.stock.message,
                    STATUS_CODES.ERROR_ARGUMENTOS,
                );
            }

            if (typeof category !== 'string' || category.trim() === '') {
                throw new CustomError(
                    ErrorCodes.Campo_Vacio.name,
                    ErrorCodes.category.message,
                    STATUS_CODES.ERROR_ARGUMENTOS,
                );
            }

            const usuario = req.session.usuario;
            let ownerEmail;

            if (usuario && usuario.role === 'premium') {
                ownerEmail = usuario.email;
            } else {
                ownerEmail = 'admin';
            }

            await ProductService.addProduct(title, description, code, price, true, stock, category, thumbnails, ownerEmail);
            console.log(ownerEmail)

            const products = await ProductService.getProducts();
            req.io.emit('updateProducts', products);

            res.status(201).json({ message: 'Producto agregado exitosamente', products: products.payload});
        } catch (error) {
            console.error('Error al agregar el producto:', error.message);
            return res.status(error.code || 500).json({ name: error.name, code: STATUS_CODES.ERROR_ARGUMENTOS, message: error.message, });
        }
    }

    async updateProduct(req, res) {
        const productId = req.params.id;
        const updatedProduct = req.body;
        const usuario = req.session.usuario;

        try {

            const existingProduct = await ProductService.getProductById(productId);

            if (!existingProduct) {
                return res.status(404).json({ error: 'Producto no encontrado' });
            }

            if (usuario.role !== 'premium' && usuario.role !== 'admin') {
                return res.status(403).json({ error: 'Permiso denegado' });
            }

            if (usuario.role === 'premium' && existingProduct.owner !== usuario.email) {
                return res.status(403).json({ error: 'No tienes permiso para actualizar este producto, pertenece a otro usuario' });
            }

            await ProductService.updateProduct(productId, updatedProduct);

            const products = await ProductService.getProducts();
            req.io.emit('updateProducts', products);

            res.status(200).json({ message: 'Producto actualizado exitosamente' });
        } catch (error) {
            console.error(`Error al actualizar el producto con ID ${productId}:`, error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    }

    async getProductById(req, res) {
        const productId = req.params.id;

        try {
            const product = await ProductService.getProductById(productId);
            if (product) {
                res.status(200).json({ product });
            } else {
                res.status(404).json({ error: 'Producto no encontrado' });
            }
        } catch (error) {
            console.error(`Error al obtener el producto con ID ${productId}:`, error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    }

    async deleteProduct(req, res) {
        const productId = req.params.id;
        const usuario = req.session.usuario;

        const existingProduct = await ProductService.getProductById(productId);
        if (!existingProduct) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        try {
            if (usuario.role !== 'admin' && (usuario.role !== 'premium' || existingProduct.owner !== usuario.email)) {
                return res.status(403).json({ error: 'Permiso denegado, intentas eliminar el producto de otro usuario' });
            }
            await ProductService.deleteProduct(productId);

            req.io.emit('productDeleted', { productId });

            const products = await ProductService.getProducts();
            req.io.emit('updateProducts', products);

            res.status(200).json({ message: 'Producto eliminado exitosamente' });
        } catch (error) {
            console.error(`Error al eliminar el producto con ID ${productId}:`, error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    }
}

module.exports = new ProductController();
