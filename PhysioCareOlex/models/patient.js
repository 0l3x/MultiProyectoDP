const mongoose = require('mongoose');

let patientSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 2,
        maxlength: 50
    },
    surname: {
        type: String,
        required: true,
        minlength: 2,
        maxlength: 50
    },
    birthDate: {
        type: Date,
        required: true
    },
    address: {
        type: String,
        maxlength: 100
    },
    insuranceNumber: {
        type: String,
        required: true,
        match: /^[a-zA-Z0-9]{9}$/,
        unique: true
    },
    email: {
        type: String,
        required: false,
        match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    },
    userID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
    },
});

let Patient = mongoose.model('patients', patientSchema);
module.exports = Patient;
