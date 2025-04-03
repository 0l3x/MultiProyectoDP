// Librerías externas
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

// Enrutadores
const patients = require(__dirname + '/routes/patients');
const physios = require(__dirname + '/routes/physios');
const records = require(__dirname + '/routes/records');
const auth = require(__dirname + '/routes/auth');

let app = express();

// Conexión a la base de datos
mongoose.connect(process.env.DATABASE_URL).then(() => {
    console.log('Conexión exitosa a MongoDB');
  })
  .catch((error) => {
    console.error('Error conectando a MongoDB:', error);
});


app.use(express.json());
app.use('/patients', patients);
app.use('/physios', physios);
app.use('/records', records);
app.use('/auth', auth);

app.listen(process.env.PUERTO);
