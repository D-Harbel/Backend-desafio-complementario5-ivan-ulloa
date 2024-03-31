class CustomError extends Error{
    constructor(nombre, mensaje, statusCode, descripcion){
        super(mensaje)
        this.name=nombre
        this.codigo=statusCode
        this.descripcion=descripcion
    }
}
module.exports = { CustomError };