const productDao = require('../dao/productDao');

class ProductService {
    async getProducts({ limit, page, sort, query } = {}) {
        return productDao.getProducts({ limit, page, sort, query });
    }

    async addProduct(title, description, code, price, status, stock, category, thumbnails, ownerEmail ) {
        return productDao.addProduct(title, description, code, price, status, stock, category, thumbnails, ownerEmail);
    }

    async updateProduct(id, updatedProduct) {
        return productDao.updateProduct(id, updatedProduct);
    }

    async getProductById(id) {
        return productDao.getProductById(id);
    }

    async deleteProduct(id) {
        return productDao.deleteProduct(id);
    }
}

module.exports = new ProductService();