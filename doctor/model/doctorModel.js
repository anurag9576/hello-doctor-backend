const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'usermaster', required: true, unique: true },
    
    
    basicInfo: {
        name: { type: String, required: true },
        specialty: { type: String },
        experience: { type: String },
        degree: { type: String },
        clinic: { type: String },
        profileImage: { type: String }
    },
    
    patientCentricDetails: {
        about: { type: String },
        languages: { type: String },
        services: [{ type: String }]
    },
    
    consultationFees: {
        online: { type: String },
        clinic: { type: String }
    },
    
    publicStats: {
        totalPatients: { type: String },
        averageRating: { type: Number },
        totalReviews: { type: String }
    },
    
    currentStatus: {
        isAcceptingNewPatients: { type: Boolean, default: true },
        notificationsEnabled: { type: Boolean, default: true },
        isVerified: { type: Boolean, default: false }
    },
    
    practiceManagement: [{
        title: { type: String },
        icon: { type: String },
        value: { type: String }
    }]
}, { timestamps: true });

const doctorModel = mongoose.models.doctor || mongoose.model('doctorprofile', doctorSchema);

module.exports = doctorModel;
