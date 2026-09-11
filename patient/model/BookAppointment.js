const mongoose = require('mongoose');

const bookAppointmentSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },
    patientName: { type: String, required: true },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    doctorName: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    consultationType: { type: String, default: 'in-person' },
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled', 'In-Call', 'Waiting'],
      default: 'Confirmed', // We'll auto-confirm for now as per MVP flow
    },
    symptoms: { type: String },
    medicalHistory: { type: String },
    phone: { type: String },
    gender: { type: String },
    age: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('BookAppointment', bookAppointmentSchema);
