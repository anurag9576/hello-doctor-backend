const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'usermaster', required: true, unique: true },
    patientId: { type: String, required: true, unique: true },
    
    basicInfo: {
        fullName: { type: String, required: true },
        gender: { type: String },
        dob: { type: String },
        phone: { type: String },
        email: { type: String },
        address: { type: String }
    },
    
    emergencyContact: {
        name: { type: String },
        relationship: { type: String },
        phone: { type: String }
    },
    
    medicalInfo: {
        bloodGroup: { type: String },
        height: { type: String },
        weight: { type: String },
        existingConditions: { type: String },
        allergies: { type: String },
        pastSurgeries: { type: String }
    },
    
    currentHealth: {
        symptoms: { type: String },
        medications: { type: String },
        assignedDoctor: { type: String }
    },
    
    lifestyle: {
        smoking: { type: String },
        alcohol: { type: String },
        exercise: { type: String },
        diet: { type: String }
    },
    
    insurance: {
        hasInsurance: { type: Boolean },
        provider: { type: String },
        policyNumber: { type: String },
        preferredHospital: { type: String }
    },
    
    metaData: {
        memberSince: { type: String },
        lastUpdated: { type: String }
    }
}, { timestamps: true });

const patientModel = mongoose.models.patient || mongoose.model('patientprofile', patientSchema);

module.exports = patientModel;
