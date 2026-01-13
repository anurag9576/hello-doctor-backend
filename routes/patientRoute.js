const express = require('express');
const { savePatientProfile, getPatientProfile, deletePatientProfile, getAllProfiles } = require('../patient/controller/patientController');
const authPatient = require('../master/middlewares/authPatient');

const patientRouter = express.Router();

// Save or Update Profile (No token required - send userId in body)
patientRouter.post('/save-profile', savePatientProfile);

// Explicit Update Profile (No token required - send userId in body)
patientRouter.post('/update-profile', savePatientProfile);

// Get Profile (No token required - send userId in body or query)
patientRouter.get('/get-profile', getPatientProfile);

// Delete Profile (No token required - send userId in body)
patientRouter.post('/delete-profile', deletePatientProfile);

// Get all profiles
patientRouter.get('/all-profiles', getAllProfiles);

module.exports = patientRouter;
