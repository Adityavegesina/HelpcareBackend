const mongoose = require('mongoose');
const patientPersonalInfoSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        required: true
    },
    gender: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    contact: {
        type: Number,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    emergencycontact: {
        type:Number,
        required: false
    }
},
    {
        timestamps: true,
    }
);



module.exports = mongoose.model('Patient', patientPersonalInfoSchema);
