const express = require('express');
const { saveDoctorProfile, getDoctorProfile, getAllDoctorProfiles } = require('../doctor/controller/doctorController');
const authUser = require('../master/middlewares/authPatient');

const doctorRouter = express.Router();

doctorRouter.post('/save-profile', authUser, saveDoctorProfile);
doctorRouter.post('/update-profile', authUser, saveDoctorProfile); // Explicit update route
doctorRouter.get('/get-profile', authUser, getDoctorProfile); // Works with query param ?userId=...
doctorRouter.get('/profile/:userId', getDoctorProfile); // Works with path param /profile/...
doctorRouter.get('/all-profiles', getAllDoctorProfiles);

module.exports = doctorRouter;
