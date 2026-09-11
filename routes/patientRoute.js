const express = require('express');
const { savePatientProfile, getPatientProfile, deletePatientProfile, getAllProfiles } = require('../patient/controller/patientController');
const authPatient = require('../master/middlewares/authPatient');

const patientRouter = express.Router();

// Save or Update Profile
patientRouter.post('/save-profile', authPatient, savePatientProfile);

// Explicit Update Profile
patientRouter.post('/update-profile', authPatient, savePatientProfile);

// Get Profile
patientRouter.get('/get-profile', authPatient, getPatientProfile);

// Delete Profile
patientRouter.post('/delete-profile', authPatient, deletePatientProfile);

// Get all profiles
patientRouter.get('/all-profiles', getAllProfiles);

// Appointment routes
const { bookAppointment, getPatientAppointments } = require('../patient/controller/appointmentController');
patientRouter.post('/book-appointment', authPatient, bookAppointment);
patientRouter.get('/appointments', authPatient, getPatientAppointments);

module.exports = patientRouter;
