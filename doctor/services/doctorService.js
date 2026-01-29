const doctorModel = require('../model/doctorModel');
const userModel = require('../../master/models/userModel');

/**
 * Service to save or update a doctor profile
 */
const saveOrUpdateProfile = async (userId, profileData) => {
    // Sync with UserMaster if basicInfo is updated
    if (profileData.basicInfo) {
        const userUpdateData = {};
        if (profileData.basicInfo.name) userUpdateData.name = profileData.basicInfo.name;
        if (profileData.basicInfo.specialty) userUpdateData.department = profileData.basicInfo.specialty; // Mapping specialty to department in UserMaster
        if (profileData.basicInfo.phone) userUpdateData.phone = profileData.basicInfo.phone;
        
        if (Object.keys(userUpdateData).length > 0) {
            await userModel.findByIdAndUpdate(userId, userUpdateData);
        }
    }

    const updateData = { $set: { userId } };

    // Handle nested objects by using dot notation to avoid overwriting entire objects
    const sections = ['basicInfo', 'patientCentricDetails', 'consultationFees', 'publicStats', 'currentStatus'];
    
    sections.forEach(section => {
        if (profileData[section]) {
            Object.keys(profileData[section]).forEach(key => {
                updateData.$set[`${section}.${key}`] = profileData[section][key];
            });
        }
    });

    // Handle arrays and other top-level fields
    if (profileData.practiceManagement) updateData.$set.practiceManagement = profileData.practiceManagement;

    // Find and update or create a new profile (upsert)
    return await doctorModel.findOneAndUpdate(
        { userId },
        updateData,
        { new: true, upsert: true, runValidators: true }
    ).populate('userId', 'name email phone role department');
}

/**
 * Service to find a doctor profile by userId
 */
const findProfileByUserId = async (userId) => {
    return await doctorModel.findOne({ userId }).populate('userId', 'name email phone role department');
}

/**
 * Service to find all doctor profiles
 */
const findAllProfiles = async () => {
    return await doctorModel.find({}).populate('userId', 'name email phone role department');
}

module.exports = {
    saveOrUpdateProfile,
    findProfileByUserId,
    findAllProfiles
};
