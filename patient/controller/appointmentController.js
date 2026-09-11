const BookAppointment = require('../model/BookAppointment');
const Notification = require('../../doctor/model/notificationModel');

// Book a new appointment
exports.bookAppointment = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : req.body.patientId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const {
      doctorId,
      doctorName,
      date,
      time,
      consultationType,
      symptoms,
      medicalHistory,
      phone,
      patientName,
      gender,
      age
    } = req.body;

    if (!doctorId || !date || !time) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // 1. Create Appointment in DB
    const appointment = new BookAppointment({
      patientId: userId,
      patientName: patientName || 'Patient',
      doctorId,
      doctorName,
      date,
      time,
      consultationType,
      symptoms,
      medicalHistory,
      phone,
      gender,
      age,
      status: 'Confirmed'
    });

    await appointment.save();

    // 2. Create Notification for the Doctor
    const notif = new Notification({
      userId: doctorId,
      type: 'appointment_booked',
      title: 'New Appointment Booked',
      message: `${patientName || 'A patient'} has booked a ${consultationType} appointment on ${date} at ${time}.`,
      data: { appointmentId: appointment._id }
    });

    await notif.save();

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully',
      appointment
    });
  } catch (error) {
    console.error('Error booking appointment:', error);
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// Get all appointments for a patient
exports.getPatientAppointments = async (req, res) => {
  try {
    const userId = req.user.id;
    const appointments = await BookAppointment.find({ patientId: userId }).sort({ createdAt: -1 });
    res.json({ success: true, appointments });
  } catch (error) {
    console.error('Error fetching patient appointments:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Get all appointments for a doctor
exports.getDoctorAppointments = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const appointments = await BookAppointment.find({ doctorId }).sort({ createdAt: -1 });
    res.json({ success: true, appointments });
  } catch (error) {
    console.error('Error fetching doctor appointments:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
