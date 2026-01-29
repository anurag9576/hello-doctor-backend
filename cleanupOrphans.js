const mongoose = require('mongoose');
require('dotenv').config();
const userModel = require('./master/models/userModel');
const doctorModel = require('./doctor/model/doctorModel');
const patientModel = require('./patient/model/patientModel');

const cleanOrphanedProfiles = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hellodoctor');
        console.log('Connected to Database');

        // Find all doctor profiles
        const doctorProfiles = await doctorModel.find({});
        console.log(`Checking ${doctorProfiles.length} doctor profiles...`);
        
        for (const profile of doctorProfiles) {
            const user = await userModel.findById(profile.userId);
            if (!user) {
                console.log(`Deleting orphaned doctor profile for userId: ${profile.userId}`);
                await doctorModel.findByIdAndDelete(profile._id);
            }
        }

        // Find all patient profiles
        const patientProfiles = await patientModel.find({});
        console.log(`Checking ${patientProfiles.length} patient profiles...`);

        for (const profile of patientProfiles) {
            const user = await userModel.findById(profile.userId);
            if (!user) {
                console.log(`Deleting orphaned patient profile for userId: ${profile.userId}`);
                await patientModel.findByIdAndDelete(profile._id);
            }
        }

        console.log('Cleanup complete!');
        process.exit(0);
    } catch (error) {
        console.error('Error during cleanup:', error);
        process.exit(1);
    }
};

cleanOrphanedProfiles();
