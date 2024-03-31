const express = require('express');
const router = express.Router();
const { redirectToHomeIfAdmin } = require('../middleware/authorization');
const { logger } = require('../utils/winston')

module.exports = function (io, MessageDao) {
    router.get('/', redirectToHomeIfAdmin, async (req, res) => {
        try {
            const messages = await MessageDao.getMessages();
            res.render('chat', { messages });
        } catch (error) {
            console.error('Error al obtener mensajes:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    });

    io.on('connection', async (socket) => {
        logger.info('Cliente conectado');

        socket.on('mensaje', async (datos) => {
            await MessageDao.addMessage(datos.emisor.correo, datos.mensaje);


            io.emit('nuevoMensaje', datos);
        });

        socket.on('disconnect', () => {
            logger.info('Cliente desconectado');
        });
    });

    return router;
};