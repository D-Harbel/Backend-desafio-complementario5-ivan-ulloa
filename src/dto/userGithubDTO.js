class UserReadGithubDTO {
    constructor(usuario) {
        this.nombre = usuario.first_name.toUpperCase()
        this.edad = usuario.age;
        this.email = usuario.email;
        this.rol = usuario.role;
    }
}

module.exports = UserReadGithubDTO;