const express = require('express');
const User = require('../models/users');
const { generarToken } = require('../auth/auth');
const Patient = require("../models/patient");
const Physio = require("../models/physio");

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
        return res.status(401).json({ error: "Login incorrecto, contraseña incorrecta" });
    }

    let idActual = null;

    if (usuario.rol === "patient") {
        const paciente = await Patient.findOne({ userID: usuario._id });
        if (!paciente) return res.status(401).json({ ok: false, error: "Paciente no vinculado" });
        idActual = paciente._id;
    }

    if (usuario.rol === "physio") {
        const fisio = await Physio.findOne({ userID: usuario._id });
        if (!fisio) return res.status(401).json({ ok: false, error: "Fisio no vinculado" });
        idActual = fisio._id;
    }

    // Generar token
    const token = generarToken(usuario);
    res.status(200).json({ token: token, rol: usuario.rol, 
        usuario: idActual // Este ID es el del paciente o fisio
    });
});

module.exports = router;
