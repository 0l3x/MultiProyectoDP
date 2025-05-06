const express = require("express");
let Physio = require(__dirname + "/../models/physio.js");
const { protegerRuta } = require('../auth/auth');
const e = require("express");

let router = express.Router();

// GET
router.get("/", protegerRuta(["admin", "physio", "patient"]), (req, res) => {
    Physio.find()
        .then((resultado) => {
            if (resultado) res.status(200).send({ ok: true, resultado });
            else
                res
                    .status(404)
                    .send({ ok: false, error: "No hay fisios en el sistema" });
        })
        .catch((error) => {
            res.status(500).send({ ok: false, error: "Error, fallo interno en el servidor" });
        });
});

// GET por especialidad
router.get("/find", protegerRuta(["admin", "physio", "patient"]), (req, res) => {
    Physio.find({ 
        specialty: { $regex: req.query.specialty, $options: "i" }
    }). then(resultado => {
        if (resultado) res.status(200).send({ ok: true, resultado: resultado });
        else res.status(404).send({ ok: false, error: "No se ha encontrado el fisio" });
    }).catch(error => {
        res.status(500).send({ ok: false, error: "Error, fallo interno en el servidor" });
    });
});

// GET con id
router.get("/:id", protegerRuta(["admin", "physio", "patient"]), (req, res) => {
    Physio.findById(req.params.id)
        .then(resultado => {
            if (resultado) res.status(200).send({ ok: true, resultado: resultado });
            else
                res
                    .status(404)
                    .send({ ok: false, error: "No se ha encontrado el fisio" });
        })
        .catch(error => {
            res
                .status(500)
                .send({ ok: false, error: "Error, fallo interno en el servidor" });
        });
});



// POST
router.post("/", protegerRuta(["admin"]), (req, res) => {
    let newPhysio = new Physio(req.body);
    newPhysio
        .save()
        .then(resultado => {
            if (resultado) res.status(201).send({ ok: true, resultado: resultado });
            else
                res
                    .status(400)
                    .send({ ok: false, error: "No se ha podido insertar el fisio" });
        })
        .catch((error) => {
            res.status(500).send({ ok: false, error: error.toString() });
        });
});

// PUT
router.put("/:id", protegerRuta(["admin"]), (req, res) => {
    Physio.findByIdAndUpdate(req.params.id, {
        $set: {
            name: req.body.name,
            surname: req.body.surname,
            specialty: req.body.specialty,
            licenseNumber: req.body.licenseNumber,
            email: req.body.email
        }
    }, { new: true }).then(resultado => {
        if (resultado) res.status(200)
           .send({ok: true, resultado: resultado});
        else res.status(400)
            .send({ok: false, error: "No se ha podido actualizar el fisio"});
    }).catch(error => {
        res.status(500)
           .send({ok: false, 
                  error:"Error interno en el servidor"});
    });
});


// DELETE
router.delete("/:id", protegerRuta(["admin"]), (req, res) => {
    Physio.findByIdAndDelete(req.params.id)
        .then((resultado) => {
            if (resultado) {
                res.status(200).send({ ok: true, resultado: resultado });
            } else {
                res.status(404).send({ ok: false, error: "Fisio no encontrado" });
            }
        })
        .catch((error) => {
            res.status(500).send({ ok: false, error: "Error, fallo interno en el servidor" });
        });
});

module.exports = router;
