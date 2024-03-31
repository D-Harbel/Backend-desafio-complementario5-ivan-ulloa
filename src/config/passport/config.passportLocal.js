const passport = require('passport')
const local = require('passport-local')
const usuariosModelo = require('../../dao/models/usermodel')
const Cart = require('../../dao/models/cartModel')
const { creaHash, validaPassword } = require('../../utils/utils')

const inicializarPassport = () => {

    passport.use('registrate', new local.Strategy(
        {
            passReqToCallback: true, usernameField: 'email'
        },
        async (req, username, password, done) => {
            try {
                let { first_name, last_name, email, age } = req.body
                if (!first_name || !last_name || !age || !email || !password) {
                    return done(null, false)
                }

                if (email === 'adminCoder@coder.com') {
                    return done(null, false, { message: 'Cannot register with admin email' })
                }

                let regMail = /^(([^<>()\[\]\\.,;:\s@”]+(\.[^<>()\[\]\\.,;:\s@”]+)*)|(“.+”))@((\[[0–9]{1,3}\.[0–9]{1,3}\.[0–9]{1,3}\.[0–9]{1,3}])|(([a-zA-Z\-0–9]+\.)+[a-zA-Z]{2,}))$/
                req.logger.debug(regMail.test(email))
                if (!regMail.test(email)) {
                    return done(null, false)
                }

                let existe = await usuariosModelo.findOne({ email })
                if (existe) {
                    return done(null, false)
                }

                password = creaHash(password)
                console.log(password)

                let usuario
                let nuevoCarrito;

                try { 
                    nuevoCarrito = await Cart.create({ usuario: null, products: [] });
                    usuario = await usuariosModelo.create({ first_name, last_name, email, password, age, role: 'user', cart: nuevoCarrito._id });

                    await Cart.findByIdAndUpdate(nuevoCarrito._id, { usuario: usuario._id });
                    return done(null, usuario)

                } catch (error) {
                    console.error(error);
                    return done(null, false)
                }
            } catch (error) {
                return done(error)
            }


        }
    ))

    passport.use('login', new local.Strategy(
        {
            usernameField: 'email'
        },
        async (username, password, done) => {
            try {
                if (!username || !password) {
                    return done(null, false, { message: 'All fields are required' })
                }

                if (username === 'adminCoder@coder.com' && password === 'adminCod3r123') {
                    const adminUser = {
                        first_name: 'Admin',
                        last_name: 'Coder',
                        age: 99,
                        email: 'adminCoder@coder.com',
                        role: 'admin',
                        cart: '65a8475e30b68acfb603a9a4'
                    };

                    return done(null, adminUser)
                }

                let usuario = await usuariosModelo.findOne({ email: username }).lean();

                if (!usuario) {
                    console.log('Usuario no encontrado en la base de datos');
                    return done(null, false);
                }

                if (!validaPassword(usuario, password)) {
                    return done(null, false);
                }
                delete usuario.password
                return done(null, usuario)

            } catch (error) {
                done(error, null)
            }
        }
    ))

    passport.serializeUser((usuario, done) => {
        if (usuario.role) {
            return done(null, 'admin');
        } else {
            return done(null, usuario._id);
        }
    });

    passport.deserializeUser(async (id, done) => {
        if (id === 'admin') {
            return done(null, {
                nombre: 'Admin',
                apellido: 'Coder',
                email: 'adminCoder@coder.com',
                cart: '65a8475e30b68acfb603a9a4',
                role: 'admin',
            });
        } else {
            try {
                let usuario = await usuariosModelo.findById(id);
                if (!usuario) {
                    return done(new Error('Usuario no encontrado'), null);
                }
                return done(null, usuario);
            } catch (error) {
                done(error, null);
            }
        }
    });
}

module.exports = inicializarPassport