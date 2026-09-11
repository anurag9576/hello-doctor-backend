const express = require('express');
const { saveDoctorProfile, getDoctorProfile, getAllDoctorProfiles, deleteDoctorProfile, createNotification, getDoctorNotifications, markNotificationsRead } = require('../doctor/controller/doctorController');
const authUser = require('../master/middlewares/authPatient');

const doctorRouter = express.Router();

doctorRouter.post('/save-profile', authUser, saveDoctorProfile);
doctorRouter.post('/update-profile', authUser, saveDoctorProfile); // Explicit update route
doctorRouter.get('/get-profile', authUser, getDoctorProfile); // Works with query param ?userId=...
doctorRouter.get('/profile/:userId', getDoctorProfile); // Works with path param /profile/...
doctorRouter.get('/all-profiles', getAllDoctorProfiles);
doctorRouter.post('/delete-profile', deleteDoctorProfile);

// Notification routes
doctorRouter.post('/notify', createNotification); // No auth - called by patient app
doctorRouter.get('/notifications', authUser, getDoctorNotifications);
doctorRouter.post('/notifications/read', authUser, markNotificationsRead);

// Appointment routes
const { getDoctorAppointments } = require('../patient/controller/appointmentController');
doctorRouter.get('/appointments', authUser, getDoctorAppointments);

module.exports = doctorRouter;
