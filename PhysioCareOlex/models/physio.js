const mongoose = require('mongoose');

let physioSchema = new mongoose.Schema({
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
    specialty: {
        type: String,
        required: true,
        enum: ['Sports', 'Neurological', 'Pediatric', 'Geriatric', 'Oncological']
    },
    licenseNumber: {
        type: String,
        required: true,
        match: /^[a-zA-Z0-9]{8}$/,
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

let Physio = mongoose.model('physios', physioSchema);
module.exports = Physio;
