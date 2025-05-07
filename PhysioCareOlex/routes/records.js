const express = require("express");
let Record = require(__dirname + "/../models/record.js");
let Patient = require(__dirname + "/../models/patient.js");
const { protegerRuta } = require('../auth/auth');
const mongoose = require("mongoose");

let router = express.Router();

// GET
router.get("/", protegerRuta(["admin", "physio"]), (req, res) => {
    Record.find()
        .then((resultado) => {
            if (resultado) res.status(200).send({ ok: true, resultado });
            else
                res
                    .status(404)
                    .send({ ok: false, error: "No hay expedientes en el sistema" });
        })
        .catch((error) => {
            res
                .status(500)
                .send({ ok: false, error: "Error, fallo interno en el servidor" });
        });
});

// GET por apellido
router.get("/find", protegerRuta(["admin", "physio"]), (req, res) => {
    Patient.find({
        surname: { $regex: req.query.surname, $options: "i" },
    })
        .then((resultadoPaciente) => {
            let idPaciente = resultadoPaciente.map((paciente) => paciente.id);
            Record.find({ patient: { $in: idPaciente } })
                .populate("patient")
                .then((resultado) => {
                    if (resultado) res.status(200).send({ resultado: resultado });
                    else res.status(404).send({ error: "No se encontraron expedientes" });
                });
        })
        .catch((error) => {
            res.status(500).send({ error: "Error, fallo interno en el servidor" });
        });
});

// GET con id
router.get("/:id", protegerRuta(["admin", "physio", "patient"]), async (req, res) => {
    try {
        // Busca el expediente con el ID y puebla la información del paciente (para evitar undefined)
        const resultado = await Record.findById(req.params.id).populate("patient").exec();

        if (!resultado) {
            return res.status(404).json({ ok: false, error: "No se ha encontrado el expediente" });
        }

        console.log(`Expediente encontrado para paciente: ${resultado.patient.name}`);

        // Si el usuario es "patient", solo puede ver su propio expediente comparando `name` con `login`
        if (req.usuario.rol === "patient" && req.usuario.login !== resultado.patient.name) {
            console.log(`Acceso denegado: ${req.usuario.login} intentó acceder a expediente de ${resultado.patient.name}`);
            return res.status(403).json({ ok: false, error: "Acceso no autorizado" });
        }

        res.status(200).json({ ok: true, resultado });
    } catch (error) {
        console.error("Error en GET /records/:id:", error);
        res.status(500).json({ ok: false, error: "Error en el servidor" });
    }
});

// POST
router.post('/', protegerRuta(["admin", "physio"]), async (req, res) => {
    const { date, patient, physio, treatment } = req.body;
    const newRecord = new Record({
        date,
        patient,
        physio,
        treatment
    });
    newRecord.save()
        .then((resultado) => {
            if (resultado) res.status(201).send({ ok: true, resultado: resultado });
            else res.status(400).send({ ok: false, error: "No se ha podido crear el expediente" });
        }).catch((err) => {
            res.status(500).send({ ok: false, error: "Error interno en el servidor" });
        });
});

// POST, anyadiendo consultas
router.post("/:id/appointments", protegerRuta(["admin", "physio"]), async (req, res) => {
    // console.log("Ruta alcanzada: /records/:id/appointments");
    // console.log("ID del paciente:", req.params.id);
    // console.log("Datos de la cita:", req.body);
    try {
        const { id } = req.params;
        const appointment = {
            date: req.body.date,
            physio: req.body.physio,
            diagnosis: req.body.diagnosis,
            treatment: req.body.treatment,
            observations: req.body.observations,
        };

        const result = await Record.findOneAndUpdate(
            { patient: id },
            { $push: { appointments: appointment } },
            { new: true }
        );

        if (result) {
            res.status(201).send({ result });
        } else {
            res
                .status(404)
                .send({ error: "No se encontró el expediente del paciente" });
        }
    } catch (error) {
        console.error("Error:", error);
        res.status(500).send({ error: "Error interno del servidor" });
    }
});

// DELETE
router.delete("/:id", protegerRuta(["admin", "physio"]), (req, res) => {
    Record.findByIdAndDelete(req.params.id)
        .then((resultado) => {
            if (resultado) {
                res.status(200).send({ ok: true, resultado: resultado });
            } else {
                res.status(404).send({ ok: false, error: "Expediente no encontrado" });
            }
        })
        .catch((error) => {
            res
                .status(500)
                .send({ ok: false, error: "Error, fallo interno en el servidor" });
        });
});



    // Sección MOVILES practica Physio

    // Rutas para pacientes
// GET citas por paciente
router.get("/appointments/patients/:id", protegerRuta(["admin", "physio", "patient"]), async (req, res) => {
    try {
        const patientId = req.params.id;
        const record = await Record.findOne({ patient: patientId }).populate("appointments.physio", "name");

        if (!record) return res.status(404).send({ ok: false, error: "No se encontró expediente" });

        // Filtrado por fecha (futuras y pasadas)
        const today = new Date();

        const future = record.appointments.filter(a => new Date(a.date) >= today);
        const past = record.appointments.filter(a => new Date(a.date) < today);

        res.status(200).send({ ok: true, futuras: future, pasadas: past });
    } catch (err) {
        res.status(500).send({ ok: false, error: "Error interno del servidor" });
    }
});


// GET citas por ID
router.get("/appointments/:id", protegerRuta(["admin", "physio", "patient"]), async (req, res) => {
    try {
        const allRecords = await Record.find().populate("appointments.physio", "name");
        const allAppointments = allRecords.flatMap(r => r.appointments);
        const cita = allAppointments.find(c => c._id.toString() === req.params.id);

        if (!cita) return res.status(404).send({ ok: false, error: "Cita no encontrada" });

        res.status(200).send({ ok: true, resultado: cita });
    } catch (err) {
        res.status(500).send({ ok: false, error: "Error interno" });
    }
});


// GET expediente por paciente
router.get("/patient/:id", protegerRuta(["admin", "physio", "patient"]), async (req, res) => {
    try {
        const id = req.params.id;

        if (req.usuario.rol === "patient" && req.usuario.id !== id) {
            return res.status(403).send({ ok: false, error: "Acceso denegado" });
        }

        const record = await Record.findOne({ patient: id }).populate("patient");

        if (!record) return res.status(404).send({ ok: false, error: "Expediente no encontrado" });

        res.status(200).send({ ok: true, resultado: record });
    } catch (err) {
        res.status(500).send({ ok: false, error: "Error interno" });
    }
});


    // Rutas para physios y admin
// GET citas por ID de fisio
router.get("/appointments/physio/:id", protegerRuta(["admin", "physio"]), async (req, res) => {
    try {
        const allRecords = await Record.find().populate("appointments.physio", "name");
        const allAppointments = allRecords.flatMap(r => r.appointments);
        const filtered = allAppointments.filter(a => a.physio.toString() === req.params.id.toString());

        res.status(200).send({ ok: true, resultado: filtered });
    } catch (err) {
        res.status(500).send({ ok: false, error: "Error interno del servidor" });
    }
});


// DELETE citas por ID
router.delete("/appointments/:id", protegerRuta(["admin", "physio"]), async (req, res) => {
    try {
        const result = await Record.updateMany(
            {},
            { $pull: { appointments: { _id: req.params.id } } }
        );

        if (result.modifiedCount === 0) {
            return res.status(404).send({ ok: false, error: "Cita no encontrada" });
        }

        res.status(200).send({ ok: true, resultado: result });
    } catch (err) {
        res.status(500).send({ ok: false, error: "Error interno" });
    }
});


// PUT citas por ID
router.put("/:id", protegerRuta(["admin", "physio"]), async (req, res) => {
    try {
        const updated = await Record.findByIdAndUpdate(req.params.id, req.body, { new: true });

        if (!updated) return res.status(404).send({ ok: false, error: "Record no encontrado" });

        res.status(200).send({ ok: true, resultado: updated });
    } catch (err) {
        res.status(500).send({ ok: false, error: "Error interno" });
    }
});


// aun no se: 
router.get("/moviles", protegerRuta(["admin", "physio"]), async (req, res) => {
    try {
        const resultado = await Record.find().populate("patient");
        res.status(200).send({ ok: true, resultado });
    } catch (err) {
        res.status(500).send({ ok: false, error: "Error interno" });
    }
});
router.get("/:id/appointments", protegerRuta(["admin", "physio"]), async (req, res) => {
    try {
        const record = await Record.findById(req.params.id);

        if (!record) return res.status(404).send({ ok: false, error: "Record no encontrado" });

        res.status(200).send({ ok: true, resultado: record.appointments });
    } catch (err) {
        res.status(500).send({ ok: false, error: "Error interno" });
    }
});

// parece util:

// const { tipo } = req.query; // tipo = "futuras" o "pasadas"
// if (tipo === "futuras") return res.send({ ok: true, resultado: future });
// if (tipo === "pasadas") return res.send({ ok: true, resultado: past });


module.exports = router;
