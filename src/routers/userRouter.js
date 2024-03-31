const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');
const { isAdmin } = require('../middleware/authorization');
const upload = require('../utils/multer');

module.exports = function (io) {
    router.post('/premium/:uid', UserController.changeUserRole);
    router.post('/:uid/documents', upload.array('documents'), UserController.uploadDocuments);
    return router;
}
