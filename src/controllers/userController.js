const UserModel = require('../dao/models/usermodel');
const upload = require('../utils/multer');


class userController {
    async changeUserRole(req, res) {
        const userId = req.params.uid;
        let newRole;

        try {
            const userRole = await UserModel.findById(userId);

            if (!userRole) {
                return res.status(404).json({ error: 'Usuario no encontrado' });
            }

            newRole = userRole.role === 'user' ? 'premium' : 'user';

            if (newRole !== "user" && newRole !== "premium") {
                return res.status(400).json({ error: 'Rol de usuario no válido' });
            }

            const updatedUser = await UserModel.findByIdAndUpdate(userId, { role: newRole }, { new: true });

            if (!updatedUser) {
                return res.status(404).json({ error: 'Usuario no encontrado' });
            }

            return res.status(200).json(updatedUser);
        } catch (error) {
            console.error(`Error al cambiar el rol del usuario con ID ${userId}:`, error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    }

    async uploadDocuments(req, res) {
        const userId = req.params.uid;
    
        try {
            const uploadedFiles = req.files.map(file => ({ fileName: file.filename, filePath: file.path }));
    
            const updatedUser = await UserModel.findByIdAndUpdate(
                userId,
                { $push: { documents: { $each: uploadedFiles } } },
                { new: true }
            );
    
            if (!updatedUser) {
                return res.status(404).json({ error: 'Usuario no encontrado' });
            }
    
            return res.status(200).json(updatedUser);
        } catch (error) {
            console.error(`Error al subir documentos para el usuario con ID ${userId}:`, error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    }
}

module.exports = new userController();