const crypto = require('node:crypto');
const patientModel = require('../model/patientModel');
const userModel = require('../../master/models/userModel');


/**
 * Helper function to generate a Unique Patient ID (HD-XXXXXX)
 */
const generateUniquePatientId = async () => {
    let patientId;
    let isUnique = false;
    while (!isUnique) {
        const randomDigits = crypto.randomInt(100000, 1000000);
        patientId = `HD-${randomDigits}`;
        const existingPatient = await patientModel.findOne({ patientId });
        if (!existingPatient) isUnique = true;
    }
    return patientId;
}

/**
 * Sync user model with basic info changes
 */
const syncUserBasicInfo = async (userId, basicInfo) => {
    if (!basicInfo) return;

    const userFieldMap = {
        fullName: 'name',
        email: 'email',
        phone: 'phone',
        dob: 'dob',
        age: 'age',
    };

    const userUpdateData = {};
    for (const [key, targetField] of Object.entries(userFieldMap)) {
        if (basicInfo[key]) {
            userUpdateData[targetField] = basicInfo[key];
        }
    }

    if (Object.keys(userUpdateData).length > 0) {
        await userModel.findByIdAndUpdate(userId, userUpdateData);
    }
};

/**
 * Assign an existing or new unique patient ID to the update object
 */
const assignPatientId = async (userId, patientId, updateSet) => {
    if (patientId) {
        updateSet.patientId = patientId;
        return;
    }

    const existing = await patientModel.findOne({ userId });
    if (!existing?.patientId) {
        updateSet.patientId = await generateUniquePatientId();
    }
};

/**
 * Build dot-notation update map for nested sections to avoid overwriting entire objects
 */
const buildSectionUpdates = (profileData) => {
    const sections = ['basicInfo', 'emergencyContact', 'medicalInfo', 'currentHealth', 'lifestyle', 'insurance', 'metaData'];
    const updates = {};

    for (const section of sections) {
        const sectionData = profileData[section];
        if (sectionData) {
            for (const [key, value] of Object.entries(sectionData)) {
                updates[`${section}.${key}`] = value;
            }
        }
    }
    return updates;
};

/**
 * Service to save or update a patient profile
 */
const saveOrUpdateProfile = async (userId, profileData) => {
    // Sync with UserMaster if basicInfo is updated
    await syncUserBasicInfo(userId, profileData.basicInfo);

    // Set last updated
    profileData.metaData = {
        ...profileData.metaData,
        lastUpdated: new Date().toISOString(),
    };

    const updateData = {
        $set: {
            userId,
            ...buildSectionUpdates(profileData),
        },
    };

    await assignPatientId(userId, profileData.patientId, updateData.$set);

    // Find and update or create a new profile (upsert)
    return await patientModel.findOneAndUpdate(
        { userId },
        updateData,
        { new: true, upsert: true, runValidators: true }
    ).populate('userId', 'name email phone dob age');
};

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
    return await patientModel.find({}).populate('userId', 'name email phone dob age');
}

module.exports = {
    saveOrUpdateProfile,
    findProfileByUserId,
    deleteProfileByUserId,
    findAllProfiles,
    generateUniquePatientId
};
