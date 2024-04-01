const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let destinationFolder;
        if (file.fieldname === 'profile') {
            destinationFolder = './uploads/profiles/';
        } else if (file.fieldname === 'product') {
            destinationFolder = './uploads/products/';
        } else if (file.fieldname === 'documents') {
            destinationFolder = './uploads/documents/';
        } else if (file.fieldname === 'identificacion') {
            destinationFolder = './uploads/documents/identificacion/';
        } else if (file.fieldname === 'comprobante de estado de cuenta') {
            destinationFolder = './uploads/documents/comprobante de estado de cuenta/';
        } else if (file.fieldname === 'comprobante de domicilio') {
            destinationFolder = './uploads/documents/comprobante de domicilio/';
        } 

        cb(null, destinationFolder);
    },
    filename: function (req, file, cb) {
        const userId = req.params.uid;
        const originalname = file.originalname;
        const ext = originalname.split('.').pop();
        const fileName = `${originalname.substring(0, originalname.lastIndexOf('.'))} (${userId}).${ext}`;
        cb(null, fileName);
    }
});

const upload = multer({ storage: storage });

module.exports = upload;