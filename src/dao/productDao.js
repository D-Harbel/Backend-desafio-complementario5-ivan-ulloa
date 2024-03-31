const { Product } = require('./index');


class ProductDao {
    async getProducts({ limit, page, sort, query } = {}) {
        try {
            const filter = {};
    
            if (query) {
                filter.$or = [
                    { category: query },
                    { title: { $regex: query, $options: 'i' } },
                    { description: { $regex: query, $options: 'i' } },
                    { code: { $regex: query, $options: 'i' } },
                    { status: query === 'available' ? true : false },
                    {
                        $or: [
                            { price: isNaN(query) ? null : parseFloat(query) },
                            { stock: isNaN(query) ? null : parseInt(query) },
                        ]
                    }
                ];
            }
    
            const options = {
                page: parseInt(page) || 1,
                limit: parseInt(limit) || 50,
                sort: sort ? { price: sort === 'asc' ? 1 : -1 } : undefined,
            };
    
            const result = await Product.paginate(filter, options);
    
    
            const plainDocs = result.docs.map(doc => {
                const plainDoc = {};
                Object.keys(doc._doc).forEach(key => {
                    plainDoc[key] = doc[key];
                });
                return plainDoc;
            });
    
            const totalPages = result.totalPages;
            const hasPrevPage = result.hasPrevPage;
            const hasNextPage = result.hasNextPage;
            const prevPage = hasPrevPage ? result.prevPage : null;
            const nextPage = hasNextPage ? result.nextPage : null;
    
            const response = {
                status: 'success',
                payload: plainDocs,
                totalPages,
                prevPage,
                nextPage,
                page: result.page,
                hasPrevPage,
                hasNextPage,
                prevLink: hasPrevPage ? `/products?limit=${limit}&page=${prevPage}` : null,
                nextLink: hasNextPage ? `/products?limit=${limit}&page=${nextPage}` : null,
                limit
            };
    
            return response;
        } catch (error) {
            console.error('Error al obtener productos:', error);
            throw error;
        }
    }

    async addProduct(title, description, code, price, status, stock, category, thumbnails, ownerEmail ) {
        try {
            const product = new Product({
                title,
                description,
                code,
                price,
                status,
                stock,
                category,
                thumbnails,
                owner: ownerEmail
            });

            await product.save();
        } catch (error) {
            console.error('Error al agregar un producto:', error);
            throw error;
        }
    }

    async updateProduct(id, updatedProduct) {
        try {
            const existingProduct = await Product.findById(id);

            if (!existingProduct) {
                throw new Error(`No se encontró el producto con el ID ${id}`);
            }

            const isCodeTaken = await Product.exists({ code: updatedProduct.code, _id: { $ne: id } });

            if (isCodeTaken) {
                throw new Error(`Ya existe un producto con el código ${updatedProduct.code}`);
            }

            Object.assign(existingProduct, updatedProduct);

            await existingProduct.save();
        } catch (error) {
            console.error(`Error al actualizar un producto con ID ${id}:`, error);
            throw error;
        }
    }

    async getProductById(id) {
        try {
            return await Product.findById(id);
        } catch (error) {
            console.error(`Error al obtener el producto con ID ${id}:`, error);
            throw error;
        }
    }

    async deleteProduct(id) {
        try {
            const existingProduct = await Product.findById(id);

            if (!existingProduct) {
                throw new Error(`No se encontró el producto con el ID ${id}`);
            }

            const result = await Product.findByIdAndDelete(id);

            if (!result) {
                throw new Error(`No se encontró el producto con el ID ${id}`);
            }

            console.log('Producto eliminado');
            return result;
        } catch (error) {
            console.error(`Error al eliminar el producto con ID ${id}:`, error);
            throw error;
        }
    }
}

module.exports = new ProductDao();