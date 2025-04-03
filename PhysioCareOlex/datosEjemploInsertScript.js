const mongoose = require('mongoose');
const Patient = require('./models/patient');
const Physio = require('./models/physio');
const Record = require('./models/record');
const User = require('./models/users');
require('dotenv').config();

mongoose.connect(process.env.DATABASE_URL)
  .then(async () => {
    console.log('Conectado a MongoDB');

    // Borrar todo
    await User.deleteMany({});
    await Record.deleteMany({});
    await Patient.deleteMany({});
    await Physio.deleteMany({});
    console.log('Datos anteriores eliminados');

    // Insertar pacientes
    const pacientes = await Patient.insertMany([
      {
        name: 'Carlos',
        surname: 'Ramírez',
        birthDate: new Date('1990-03-15'),
        address: 'Calle Falsa 123',
        insuranceNumber: 'ABC123XYZ'
      },
      {
        name: 'María',
        surname: 'González',
        birthDate: new Date('1985-07-09'),
        address: 'Av. Siempre Viva 742',
        insuranceNumber: 'DEF456LMN'
      },
      {
        name: 'Lucía',
        surname: 'Martínez',
        birthDate: new Date('1999-11-25'),
        address: 'Calle Luna 10',
        insuranceNumber: 'GHI789QWE'
      },
      {
        name: 'Jorge',
        surname: 'Pérez',
        birthDate: new Date('1978-04-03'),
        address: 'Plaza del Sol 5',
        insuranceNumber: 'JKL012RTY'
      },
      {
        name: 'Ana',
        surname: 'Sánchez',
        birthDate: new Date('2001-01-01'),
        address: 'Calle Estrella 22',
        insuranceNumber: 'MNO345UIO'
      }
    ]);

    // Insertar fisios
    const fisios = await Physio.insertMany([
      {
        name: 'Laura',
        surname: 'Torres',
        specialty: 'Sports',
        licenseNumber: 'SPRT1234'
      },
      {
        name: 'Pedro',
        surname: 'Méndez',
        specialty: 'Neurological',
        licenseNumber: 'NEUR5678'
      },
      {
        name: 'Isabel',
        surname: 'Cano',
        specialty: 'Pediatric',
        licenseNumber: 'PEDI9012'
      },
      {
        name: 'Diego',
        surname: 'López',
        specialty: 'Geriatric',
        licenseNumber: 'GERI3456'
      },
      {
        name: 'Clara',
        surname: 'Navarro',
        specialty: 'Oncological',
        licenseNumber: 'ONCO7890'
      }
    ]);

    // Crear expedientes con citas
    const records = [
      {
        patient: pacientes[0]._id,
        medicalRecord: 'Historial general saludable',
        appointments: [
          {
            date: new Date('2024-04-01'),
            physio: fisios[0]._id,
            diagnosis: 'Dolor lumbar leve tras entrenamiento',
            treatment: 'Ejercicios de estiramiento y reposo',
            observations: 'Se recomienda revisión en una semana'
          }
        ]
      },
      {
        patient: pacientes[1]._id,
        medicalRecord: 'Antecedente de cirugía de rodilla',
        appointments: [
          {
            date: new Date('2024-04-03'),
            physio: fisios[1]._id,
            diagnosis: 'Rehabilitación postoperatoria rodilla izquierda',
            treatment: 'Masoterapia y movilidad progresiva',
            observations: ''
          }
        ]
      },
      {
        patient: pacientes[2]._id,
        medicalRecord: '',
        appointments: []
      }
    ];

    await Record.insertMany(records);

    await User.insertMany([
      {
        login: 'carlos90',
        password: '123',
        rol: 'patient'
      },
      {
        login: 'laura.torres',
        password: '1234',
        rol: 'physio'
      },
      {
        login: 'admin',
        password: '12345',
        rol: 'admin'
      }
    ]);
    
    console.log('Usuarios insertados correctamente.');

    console.log('Pacientes, fisios y expedientes insertados correctamente.');
    mongoose.disconnect();
  })
  .catch(err => {
    console.error('Error:', err);
    mongoose.disconnect();
  });
