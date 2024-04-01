const UserModel = require('../dao/models/usermodel');
const upload = require('../utils/multer');


class userController {
    constructor() {
        this.changeUserRole = this.changeUserRole.bind(this);
    }
    async changeUserRole(req, res) {
        const userId = req.params.uid;
        const { role } = req.body;
    
        try {
            const user = await UserModel.findById(userId);
    
            if (!user) {
                return res.status(404).json({ error: 'Usuario no encontrado' });
            }
    
            if (role === 'premium' && user.role !== 'user') {
                return res.status(400).json({ error: 'El usuario ya es premium' });
            }
    
            if (role === 'premium' && !this.hasAllDocuments(user)) {
                return res.status(400).json({ error: 'El usuario no ha cargado todos los documentos requeridos' });
            }
    
            const updatedUser = await UserModel.findByIdAndUpdate(userId, { role }, { new: true });
    
            return res.status(200).json(updatedUser);
        } catch (error) {
            console.error(`Error al cambiar el rol del usuario con ID ${userId}:`, error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    }
    
    hasAllDocuments(user) {
        const requiredDocuments = ['identificacion', 'comprobante de domicilio','comprobante de estado de cuenta'];
        const uploadedDocuments = user.documents.map(doc => doc.name);
        
        return requiredDocuments.every(doc => uploadedDocuments.includes(doc));
    }

    async uploadDocuments(req, res) {
        const userId = req.params.uid;
        
        try {
            if (!req.files || Object.keys(req.files).length === 0) {
                return res.status(400).json({ error: 'No se han adjuntado archivos' });
            }
    
            const uploadedFiles = [];
            Object.keys(req.files).forEach(fieldname => {
                const files = req.files[fieldname];
                files.forEach(file => {
                    let documentName;
                    switch (fieldname) {
                        case 'identificacion':
                            documentName = 'identificacion';
                            break;
                        case 'comprobante de domicilio':
                            documentName = 'comprobante de domicilio';
                            break;
                        case 'comprobante de estado de cuenta':
                            documentName = 'comprobante de estado de cuenta';
                            break;
                        default:
                            const fileNameWithoutExtension = file.originalname.split('.').slice(0, -1).join('.');
                            documentName = fileNameWithoutExtension;
                            break;
                    }
                    uploadedFiles.push({ name: documentName, reference: file.path });
                });
            });
    
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