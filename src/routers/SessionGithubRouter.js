const express = require('express');
const router = express.Router();
const passport = require('passport')
const UserReadGithubDTO = require('../dto/userGithubDTO');

module.exports = function (io) {
    router.get('/github', passport.authenticate('github', {}), (req, res) => { })

    router.get('/callbackGithub', passport.authenticate('github', { failureRedirect: "/api/github/errorGithub" }), (req, res) => {
        req.session.isAuthenticated = true;
        req.logger.debug(req.user)
        req.session.usuario = {
            cartID: req.user.cart.toString(),
            first_name: req.user.first_name,
            email: req.user.email,
            role: req.user.role || 'user',
        };
        res.redirect('/views/products')

    });

    router.get('/current', async (req, res) => {
        if (req.session.isAuthenticated) {
            try {
                const usuario = req.session.usuario;
                req.logger.debug(usuario)
    
                const userDTO = new UserReadGithubDTO(usuario);
    
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

    router.get('/errorGithub', (req, res) => {

        res.setHeader('Content-Type', 'application/json');
        res.status(200).json({
            error: "Error al autenticar con Github"
        });
    });

    return router;
}