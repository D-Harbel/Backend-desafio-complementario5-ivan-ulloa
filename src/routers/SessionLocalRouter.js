const express = require('express');
const router = express.Router();
const passport = require('passport');
const { enviarEmail } = require('../mails/mails');
const usuariosModelo = require('../dao/models/usermodel');
const { creaHash, validaPassword } = require('../utils/utils');
const crypto = require('crypto');
const UserReadLocalDTO = require('../dto/userLocalDTO');


module.exports = function (io) {

    router.get('/errorLogin', (req, res) => {
        return res.redirect('/login?error=Error en el proceso de login... :(')
    })

    router.post('/login', passport.authenticate('login', { failureRedirect: '/api/sessions/errorLogin' }), async (req, res) => {
        req.session.isAuthenticated = true;
        

        req.session.usuario = {
            _id: req.user._id.toString(),
            cartID: req.user.cart.toString(),
            first_name: req.user.first_name,
            last_name: req.user.last_name,
            age: req.user.age,
            email: req.user.email,
            role: req.user.role || 'user',
        };
        req.logger.debug(req.session.usuario)

        await usuariosModelo.findByIdAndUpdate(req.user._id, { last_connection: new Date() });

        res.redirect('/views/products')
    });

    router.get('/errorRegistrate', (req, res) => {
        return res.redirect('/registrate?error=Error en el proceso de registro')
    })

    router.post('/registrate', passport.authenticate('registrate', { failureRedirect: '/api/sessions/errorRegistrate' }), async (req, res) => {

        let { email } = req.body
        res.redirect(`/login?mensaje=Usuario ${email} registrado correctamente`)
    })

    router.get('/current', async (req, res) => {
        if (req.session.isAuthenticated) {
            try {
                const usuario = req.session.usuario;
                req.logger.debug(usuario)
    
                const userDTO = new UserReadLocalDTO(usuario);
    
                return res.status(200).json({
                    user: userDTO
                });
            } catch (error) {
                req.logger.error('Error al obtener el usuario:', error);
                return res.status(500).json({
                    error: 'Error interno del servidor'
                });
            }
        } else {
            req.logger.error('No hay usuario autenticado')
            return res.status(401).json({
                error: 'No hay usuario autenticado'
            });
        }
    });

    router.post('/ResPass', async (req, res) => {
        let { email } = req.body;
        let usuario = await usuariosModelo.findOne({ email }).lean();
        if (!usuario) {
            return res.render('ResPass', { error: `No existe el email ${email}` });
        } else {
            const token = crypto.randomBytes(20).toString('hex');
            req.session.resetToken = { token, email };
            req.session.resetTokenExpires = Date.now() + 3600000;
    
            const mensaje = `Hola. Ha solicitado restablecer su contraseña.
                            Haga click en el siguiente link para restablecer su contraseña: 
                            <a href="http://localhost:3000/api/sessions/ResPass02">Restablecer Contraseña</a>.`;
    
            await enviarEmail(email, "Recuperación de Contraseña", mensaje);
            res.redirect('/login?mensaje=Recibierá en breve un mail con instrucciones para restablecer su contraseña.');
        }
    });
    
    router.get("/ResPass02", (req, res) => {
        if (!req.session.resetToken || !req.session.resetTokenExpires || req.session.resetTokenExpires < Date.now()) {
            return res.redirect('/generarNuevoCorreo');
        }
        res.render('ResPass02');
    });
    
    router.post("/ResPass03", async (req, res) => {
        const { password, password2 } = req.body;
        const { email, token } = req.session.resetToken;
        

        if (password !== password2) {
            return res.render('ResPass02', { error: "Las contraseñas no coinciden" });
        }
    
        if (!token || !req.session.resetTokenExpires || req.session.resetTokenExpires < Date.now()) {
            return res.redirect('/generarNuevoCorreo');
        }

        let usuario = await usuariosModelo.findOne({ email }).lean();
        if (!usuario) {
            return res.render('ResPass02', { error: `No existe el email ${email}` });

        }
    
        if (validaPassword(usuario, password)) {
            return res.render('ResPass02', { error: "La nueva contraseña no puede ser la misma que la anterior" });
        }
    
        const hashedPassword = creaHash(password);
        await usuariosModelo.updateOne({ email }, { password: hashedPassword });
    
        delete req.session.resetToken;
        delete req.session.resetTokenExpires;
    
        res.redirect("/login?mensaje=Contraseña restablecida exitosamente. Por favor inicie sesión.");
    });
    
    router.get('/generarNuevoCorreo', (req, res) => {
        res.redirect('/login?mensaje=El enlace ha expirado o es inválido. Por favor, solicite un nuevo correo de restablecimiento.');
    });

    router.get('/logout', async (req, res) => {
        if (req.session.isAuthenticated && req.session.usuario) {
            await usuariosModelo.findByIdAndUpdate(req.session.usuario._id, { last_connection: new Date() });
        }
    
        req.session.destroy(error => {
            if (error) {
                res.redirect('/login?error=fallo en el logout');
            } else {
                res.redirect('/login');
            }
        });
    });

    return router;
}
