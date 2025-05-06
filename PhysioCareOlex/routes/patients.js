const express = require("express");
let Patient = require(__dirname + "/../models/patient.js");
const { protegerRuta } = require('../auth/auth');
const e = require("express");

let router = express.Router();

// GET
router.get("/", protegerRuta(['admin', 'physio']), (req, res) => {
    Patient.find()
        .then((resultado) => {
            if (resultado) res.status(200).send({ ok: true, resultado });
            else
                res
                    .status(404)
                    .send({ ok: false, error: "No hay pacientes en el sistema" });
        })
        .catch((error) => {
            res.status(500).send({ ok: false, error: "Error, fallo interno en el servidor" });
        });
});


// GET por apellidos
router.get("/find", protegerRuta(["admin", "physio"]), (req, res) => {
    Patient.find({ 
        surname: { $regex: req.query.surname, $options: "i" }
    }). then(resultado => {
        if (resultado) res.status(200).send({ ok: true, resultado: resultado });
        else res.status(404).send({ ok: false, error: "No se ha encontrado el paciente" });
    }).catch(error => {
        res.status(500).send({ ok: false, error: "Error, fallo interno en el servidor" });
    });
});

// GET por id
router.get("/:id", protegerRuta(['admin', 'physio', 'patient']), async (req, res) => {
    try {
        const resultado = await Patient.findById(req.params.id); 

        if (!resultado) {
            return res.status(404).json({ ok: false, error: "Paciente no encontrado" });
        }

        // Si el usuario es un "patient", solo puede ver su perfil si su login coincide con su nombre
        if (req.usuario.rol === "patient" && req.usuario.login !== resultado.name) {
            console.log(`Acceso denegado: ${req.usuario.login} intentó acceder a ${resultado.name}`);
            return res.status(403).json({ ok: false, error: "Acceso no autorizado" });
        }
        

        res.status(200).json({ ok: true, resultado });
    } catch (error) {
        res.status(500).json({ ok: false, error: "Error en el servidor" });
    }
});

// POST
router.post("/", protegerRuta(["admin", "physio"]), (req, res) => {
    let newPatient = new Patient(req.body);
    newPatient
        .save()
        .then(resultado => {
            if (resultado) res.status(201).send({ ok: true, resultado: resultado });
            else
                res
                    .status(400)
                    .send({ ok: false, error: "No se ha podido insertar el paciente" });
        })
        .catch((error) => {
            res.status(500).send({ ok: false, error: error.toString() });
        });
});

// PUT
router.put("/:id", protegerRuta(["admin", "physio"]), (req, res) => {
    Patient.findByIdAndUpdate(req.params.id, {
        $set: {
            name: req.body.name,
            surname: req.body.surname,
            birthDate: req.body.birthDate,
            address: req.body.address,
            insuranceNumber: req.body.insuranceNumber,
            email: req.body.email
        }
    }, { new: true }).then(resultado => {
        if (resultado) res.status(200)
           .send({ok: true, resultado: resultado});
        else res.status(400)
            .send({ok: false, error: "No se ha podido actualizar el paciente"});
    }).catch(error => {
        res.status(500)
           .send({ok: false, 
                  error:"Error interno en el servidor"});
    });
});


// DELETE
router.delete("/:id", protegerRuta(["admin", "physio"]), (req, res) => {
    Patient.findByIdAndDelete(req.params.id)
        .then((resultado) => {
            if (resultado) {
                res.status(200).send({ ok: true, resultado: resultado });
            } else {
                res.status(404).send({ ok: false, error: "Paciente no encontrado" });
            }
        })
        .catch((error) => {
            res.status(500).send({ ok: false, error: "Error, fallo interno en el servidor" });
        });
});

module.exports = router;
