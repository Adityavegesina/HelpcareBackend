const asyncHandler = require("express-async-handler");
const Admin = require("../../models/adminModel");
const Doctor = require("../../models/doctorModel");
const Patient = require("../../models/patientModel");
const mongoose = require("mongoose");

const patientList = asyncHandler(async (req, res) => {
    const admininfo = await Admin.find({ userID: new mongoose.Types.ObjectId(req.params.userID) }).populate('patientInformation');
    // check if the user is authorized to access the personal information
    if (admininfo[0].userID.valueOf().toString() != req.user.id) {
        res.status(401);
        throw new Error("User not authorized");
    }
    if (!admininfo) {
        res.status(404);
        throw new Error("Admin not found");
    }
    let responseArray = [];
    for (const patient of admininfo[0].patientInformation) {
        const patientData = await Patient.find({ _id: patient._id }).populate('timeline').populate('report');
        responseArray = responseArray.concat(patientData); // array of objects - instead of using push{ it makes it an array of arrays{ harder to retrieve information}}
    }
    res.status(201).json(responseArray);
});

const activepatientList = asyncHandler(async (req, res) => {
    const admininfo = await Admin
        .find({ userID: new mongoose.Types.ObjectId(req.params.userID) })
        .populate({
            path: 'patientInformation',
            match: { activeflag: true } // Add this condition to filter patients with activeflag = true
        });
    // check if the user is authorized to access the personal information
    if (admininfo[0].userID.valueOf().toString() != req.user.id) {
        res.status(401);
        throw new Error("User not authorized");
    }
    if (!admininfo) {
        res.status(404);
        throw new Error("Admin not found");
    }
    res.status(201).json(admininfo[0].patientInformation);
});

const addPatient = asyncHandler(async (req, res) => {
    const { userID } = req.body;
    const hospital = await Admin.find({ userID: new mongoose.Types.ObjectId(req.params.userID) });

    const patient = await Patient.find({ userID: new mongoose.Types.ObjectId(userID) }).populate('timeline').populate('report');
    if (hospital[0].userID.valueOf().toString() != req.user.id) {
        res.status(401);
        throw new Error("User not authorized");
    }
    if (!hospital) {
        res.status(404);
        throw new Error('Hospital not found');
    }
    if (!patient) {
        res.status(404);
        throw new Error('Patient not found');
    }
    if (hospital[0].patientInformation.indexOf(patient[0]._id)!=-1) {
        res.status(201).json({ patient });
    }
    else {
        hospital[0].patientInformation.push(patient[0]._id);
        await hospital[0].save();
        console.log("Patient ID successfully added to the array.")
    }
    res.status(201).json({ patient });
});

const removePatientDb = asyncHandler(async (req, res) => {

    if (req.params.userID != req.user.id) {
        res.status(401);
        throw new error("User not authorised");
    }
    try {
        const { patientID } = req.body;
        const patient = await Patient.find({ userID: new mongoose.Types.ObjectId(patientID) });
        const hospital = await Admin.find({ userID: new mongoose.Types.ObjectId(req.params.userID) });
        const index = hospital[0].patientInformation.indexOf(patient[0]._id);
        if (index !== -1) {
            hospital[0].patientInformation.pull(patient[0]._id);
            await hospital[0].save(); // remember to save the changes
            console.log("Patient ID successfully removed from the array.");

        } else {
            console.log("Patient ID not found in the array.");
        }
        res.status(201).json({ message: 'Patient removed from hospital success' });
    } catch (error) {
        console.error(error);
    }
});

const checkOutPatient = asyncHandler(async (req, res) => {
    const patient = await Patient.find({ userID: new mongoose.Types.ObjectId(req.body.patientID) });
    if(req.params.userID != req.user.id){
        res.status(401);
        throw new Error("User not authorized");
    }
    if (!patient) {
        res.status(404);
        throw new Error('Patient not found');
    }
    patient[0].activeflag = false;
    await patient[0].save();
    res.status(201).json({ message: 'Patient checked out' });
});




module.exports = { activepatientList, patientList, addPatient, removePatientDb, checkOutPatient };