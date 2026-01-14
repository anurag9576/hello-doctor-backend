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
    const updateData = { $set: { userId } };
    
    // Set last updated
    if (profileData.metaData) {
        profileData.metaData.lastUpdated = new Date().toISOString();
    } else {
        profileData.metaData = { lastUpdated: new Date().toISOString() };
    }

    // Handle nested objects by using dot notation to avoid overwriting entire objects
    const sections = ['basicInfo', 'emergencyContact', 'medicalInfo', 'currentHealth', 'lifestyle', 'insurance', 'metaData'];
    
    sections.forEach(section => {
        if (profileData[section]) {
            Object.keys(profileData[section]).forEach(key => {
                updateData.$set[`${section}.${key}`] = profileData[section][key];
            });
        }
    });

    // Handle top-level fields
    if (profileData.patientId) updateData.$set.patientId = profileData.patientId;

    // Generate patientId if missing and not provided
    if (!profileData.patientId) {
        const existing = await patientModel.findOne({ userId });
        if (!existing || !existing.patientId) {
            updateData.$set.patientId = await generateUniquePatientId();
        }
    }

    // Find and update or create a new profile (upsert)
    return await patientModel.findOneAndUpdate(
        { userId },
        updateData,
        { new: true, upsert: true, runValidators: true }
    ).populate('userId', 'name email phone dob');
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
