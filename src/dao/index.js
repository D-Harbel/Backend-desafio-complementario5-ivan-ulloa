const mongoose = require('mongoose');
const config = require('../config/config')

mongoose.connect(config.mongoURI, { dbName: "ecommerce" });

const Cart = require('./models/cartModel');
const Message = require('./models/messageModel');
const Product = require('./models/productModel');

module.exports = {
    Cart,
    Message,
    Product
};