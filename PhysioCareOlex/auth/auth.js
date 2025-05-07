const jwt = require('jsonwebtoken');
const dotenv = require("dotenv");

// Cargar variables de entorno
dotenv.config();

// Función para generar un token
const generarToken = (usuario) => {
    return jwt.sign(
        { login: usuario.login, rol: usuario.rol },
        process.env.SECRETO,
        { expiresIn: '1h' }
    );
};

// Función para verificar el token
const validarToken = (token) => {
    try {
        return jwt.verify(token, process.env.SECRETO);
    } catch (e) {
        return null;
    }
};

// Middleware para proteger rutas
const protegerRuta = (rolesPermitidos = []) => {
    return (req, res, next) => {
        let token = req.headers['authorization'];
        if (token && token.startsWith('Bearer ')) {
            token = token.slice(7);
        } else {
            return res.status(401).json({ error: "Token no proporcionado o incorrecto" });
        }

        const usuario = validarToken(token);
        if (!usuario) {
            return res.status(403).json({ error: "Token inválido o expirado" });
        }

        if (rolesPermitidos.length > 0 && !rolesPermitidos.includes(usuario.rol)) {
            return res.status(403).json({ error: "Acceso no autorizado" });
        }

        req.usuario = usuario;
        next();
    };
};

module.exports = { generarToken, validarToken, protegerRuta };