const patientModel = require('../model/patientModel');

/**
 * Helper function to generate a Unique Patient ID (HD-XXXXXX)
 */
const generateUniquePatientId = async () => {
    let patientId;
    let isUnique = false;
    while (!isUnique) {
        const randomDigits = Math.floor(100000 + Math.random() * 900000);
        patientId = `HD-${randomDigits}`;
        const existingPatient = await patientModel.findOne({ patientId });
        if (!existingPatient) isUnique = true;
    }
    return patientId;
}

/**
 * Service to save or update a patient profile
 */
const saveOrUpdateProfile = async (userId, profileData) => {
    if (profileData.metaData) {
        profileData.metaData.lastUpdated = new Date().toISOString();
    } else {
        profileData.metaData = { lastUpdated: new Date().toISOString() };
    }

    if (!profileData.patientId) {
        profileData.patientId = await generateUniquePatientId();
    }

    // Find and update or create a new profile (upsert)
    return await patientModel.findOneAndUpdate(
        { userId },
        { $set: { ...profileData, userId } }, // Using $set for safer updates
        { new: true, upsert: true, runValidators: true }
    ).populate('userId', 'name email phone dob'); // Get basic info from UserMaster
}

/**
 * Service to find a patient profile by userId and merge UserMaster data
 */
const findProfileByUserId = async (userId) => {
    return await patientModel.findOne({ userId }).populate('userId', 'name email phone dob age');
}

const deleteProfileByUserId = async (userId) => {
    return await patientModel.findOneAndDelete({ userId });
}

const findAllProfiles = async () => {
    return await patientModel.find({}).populate('userId', 'name email phone dob');
}

module.exports = {
    saveOrUpdateProfile,
    findProfileByUserId,
    deleteProfileByUserId,
    findAllProfiles,
    generateUniquePatientId
};
