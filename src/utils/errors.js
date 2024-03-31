const os = require('os');

class ErrorCodes {
    static Campo_Vacio = {
        name: 'Campo vacio',
    };

    static Numeros = {
        name: 'Caracteres incorrectos',
    };

    static title = {
        message: 'El campo de title no puede quedar vacio',
    };

    static description = {
        message: 'El campo de description no puede quedar vacio',
    };

    static code = {
        message: 'El campo de code no puede quedar vacio',
    };

    static category = {
        message: 'El campo de category no puede quedar vacio',
    };

    static price = {
        message: 'Solo se permiten números positivos en el campo price',
    };

    static stock = {
        message: 'Solo se permiten números positivos en el campo stock',
    };
}

module.exports = { ErrorCodes }