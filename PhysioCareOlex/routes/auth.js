const express = require('express');
const User = require('../models/users');
const { generarToken } = require('../auth/auth');

const router = express.Router();

// Endpoint de login
router.post('/login', async (req, res) => {
    const { login, password } = req.body;

    const usuario = await User.findOne({ login });
    if (!usuario) {
        return res.status(401).json({ error: "Login incorrecto, revisa los datos introducidos" });
    }

    // Verificar la contraseña
    if (password !== usuario.password) {
        return res.status(401).json({ error: "Login incorrecto" });
    }

    // Generar token
    const token = generarToken(usuario);
    res.status(200).json({ token: token, rol: usuario.rol });
});

module.exports = router;
