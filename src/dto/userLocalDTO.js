class UserReadLocalDTO {
    constructor(usuario) {
        this.nombre = usuario.first_name.toUpperCase()
        this.apellido = usuario.last_name.toUpperCase()
        this.edad = usuario.age;
        this.email = usuario.email;
        this.rol = usuario.role;
    }
}

module.exports = UserReadLocalDTO;