const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    // The doctor who should receive this notification
    doctorUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'usermaster', required: true, index: true },

    // Notification content
    type: { 
        type: String, 
        enum: ['appointment_booked', 'appointment_cancelled', 'appointment_rescheduled', 'general'],
        default: 'general'
    },
    title: { type: String, required: true },
    message: { type: String, required: true },

    // Booking details (for appointment notifications)
    appointmentData: {
        patientName: { type: String },
        patientPhone: { type: String },
        date: { type: String },
        time: { type: String },
        consultationType: { type: String },
        symptoms: { type: String },
    },

    // Read status
    read: { type: Boolean, default: false },

}, { timestamps: true });

const notificationModel = mongoose.models.notification || mongoose.model('notification', notificationSchema);

module.exports = notificationModel;
