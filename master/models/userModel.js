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

// Post middleware to handle cascading delete
userSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        const userId = doc._id;
        try {
            if (doc.role === 'doctor') {
                // Using mongoose.model to avoid circular dependency if possible
                const doctorModel = mongoose.models.doctorprofile || mongoose.model('doctorprofile');
                await doctorModel.findOneAndDelete({ userId });
                console.log(`Cascading delete: Removed doctor profile for userId ${userId}`);
            } else if (doc.role === 'patient') {
                const patientModel = mongoose.models.patientprofile || mongoose.model('patientprofile');
                await patientModel.findOneAndDelete({ userId });
                console.log(`Cascading delete: Removed patient profile for userId ${userId}`);
            }
        } catch (error) {
            console.error(`Error in cascading delete for userId ${userId}:`, error);
        }
    }
});

const userModel = mongoose.models.user || mongoose.model('usermaster', userSchema);

module.exports = userModel;
