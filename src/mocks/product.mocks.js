const { faker } = require('@faker-js/faker/locale/es_MX');

const generateMockProducts = () => {
    const mockProducts = [];

    for (let i = 1; i <= 100; i++) {
        mockProducts.push({
            id: i,
            title: faker.commerce.productName(),
            description: faker.commerce.productDescription(),
            price: faker.commerce.price(),
            category: faker.commerce.productMaterial(),
            code: faker.string.alphanumeric(2)+faker.string.numeric({length:6, allowLeadingZeros:true}),
            stock: faker.number.int({min:10, max:100 })
        });
    }

    return mockProducts;
};

module.exports = generateMockProducts;