const mongoose = require('mongoose');

const usuariosEsquema = new mongoose.Schema(
    {
        first_name: String,
        last_name: String,
        email: { type: String, unique: true },
        age: Number,
        password: String,
        cart: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Cart',
        },
        role: { type: String, enum: ['user', 'admin', 'premium'], default: 'user' },
        documents: [
            {
                name: String,
                reference: String
            }
        ],
        last_connection: { type: Date, default: null }
    },
);

const usuariosModelo = mongoose.model('sessions', usuariosEsquema);
module.exports = usuariosModelo;