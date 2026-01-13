const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true }, // Changed to String to handle formatting/leading zeros if needed
    role: { type: String, enum: ['doctor', 'patient'], default: 'patient' },
    
    // Doctor specific fields
    department: { 
        type: String, 
        required: function() { return this.role === 'doctor'; } 
    },

    // Patient specific fields
    dob: { 
        type: String, // Storing as String "DD/MM/YYYY" as per frontend, or could convert to Date
        required: function() { return this.role === 'patient'; } 
    },
    age: {
        type: Number,
        required: function() { return this.role === 'patient'; }
    }
}, { minimize: false, timestamps: true });

const userModel = mongoose.models.user || mongoose.model('usermaster', userSchema);

module.exports = userModel;
