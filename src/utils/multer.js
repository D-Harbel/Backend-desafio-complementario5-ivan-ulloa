const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let destinationFolder;
        if (file.fieldname === 'profileImage') {
            destinationFolder = './uploads/profiles/';
        } else if (file.fieldname === 'productImage') {
            destinationFolder = './uploads/products/';
        } else if (file.fieldname === 'documents') {
            destinationFolder = './uploads/documents/';
        }
        cb(null, destinationFolder);
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage: storage });

module.exports = upload;