const fs = require('fs');

class ProductManager {
    constructor(path) {
        this.path = path
    }

    getProducts() {
        if (fs.existsSync(this.path)) {
            return JSON.parse(fs.readFileSync(this.path, "utf-8"))
        } else {
            return []
        }
    }

    addProduct(title, description, code, price, status, stock, category, thumbnails) {
        let products = this.getProducts();

        let id = 1
        if (products.length > 0) {
            id = products[products.length - 1].id + 1
        }

        let newObj = {
            id,
            title,
            description,
            code,
            price,
            status,
            stock,
            category,
            thumbnails
        };

        if (Object.values(newObj).includes(undefined)) {
            console.log("Faltan campos por ingresar");
            return;
        }

        products.push(newObj);
        fs.writeFileSync(this.path, JSON.stringify(products, null, 5));
        return;
    }

    updateProduct(id, updatedProduct) {
        let products = this.getProducts();

        let index = products.findIndex(p => p.id === id)
        if (index === -1) {
            console.log(`Not found ${id}`);
            return;
        }

        const isCodeTaken = products.some(p => p.code === updatedProduct.code && p.id !== id);

        if (isCodeTaken) {
            console.log(`Ya existe un producto con el código ${updatedProduct.code}`);
            return;
        }

        const checkObject = (check) => {
            return check === Object(check)
        }

        const checkedObject = checkObject(updatedProduct)
        if (!checkedObject) {
            console.log("Lo que intentó agregar no es un objeto");
            return;
        }

        const EmptyProducts = Object.values(updatedProduct).some(value => value === '');
        if (EmptyProducts) {
            console.log("No se permiten campos vacíos");
            return;
        }

        const existingProduct = products[index]
        const updateKeys = Object.keys(updatedProduct)

        updateKeys.forEach((key) => {
            if (existingProduct.hasOwnProperty(key)) {
                existingProduct[key] = updatedProduct[key];
            } else {
                console.log(`El parámetro de objeto ${key} no corresponde al ser distinto a los designados`);
            }
        })

        fs.writeFileSync(this.path, JSON.stringify(products, null, 5));
    }

    getProductById(id) {
        let products = this.getProducts();

        let index = products.findIndex(producto => producto.id === id)
        if (index === -1) {
            console.log(`Not found ${id}`)
            return
        }

        return products[index]
    }

    deleteProduct(id) {
        let products = this.getProducts();

        let index = products.findIndex((product) => {
            return product.id === id;
        });
        if (index === -1) {
            console.log(`Not found ${id}`)
            return
        }

        products.splice(index, 1)
        fs.writeFileSync(this.path, JSON.stringify(products, null, 5));
        console.log("Producto eliminado")
        return products[index];
    }
}

const pm = new ProductManager("./JSON/productos.json")

module.exports = ProductManager;
