const patientService = require('../services/patientService');

// API to save or update patient profile
const savePatientProfile = async (req, res) => {
    try {
        const { userId, ...profileData } = req.body;

        if (!profileData || Object.keys(profileData).length === 0) {
            return res.status(400).json({ success: false, message: "Missing Details" });
        }

        const profile = await patientService.saveOrUpdateProfile(userId, profileData);
        
        // Check if it was an update or creation
        const isUpdate = profile.createdAt && profile.updatedAt && 
                         profile.createdAt.toISOString() !== profile.updatedAt.toISOString();

        res.json({ 
            success: true, 
            message: isUpdate ? "Profile Updated Successfully" : "Profile Saved Successfully", 
            profile 
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    }
}

// API to get patient profile
const getPatientProfile = async (req, res) => {
    try {
        // Accept userId from query params (for GET) or body (for POST)
        const userId = req.query.userId || req.body.userId;
        
        if (!userId) {
            return res.status(400).json({ success: false, message: "userId is required" });
        }
        
        const profile = await patientService.findProfileByUserId(userId);
        if (!profile) {
            return res.status(404).json({ success: false, message: "Profile not found" });
        }

        res.json({ success: true, profile });

    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    }
}

// API to delete patient profile
const deletePatientProfile = async (req, res) => {
    try {
        const { userId } = req.body;

        const deletedProfile = await patientService.deleteProfileByUserId(userId);
        if (!deletedProfile) {
            return res.status(404).json({ success: false, message: "Profile not found" });
        }

        res.json({ success: true, message: "Profile Deleted Successfully" });

    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    }
}

// API to get all patient profiles
const getAllProfiles = async (req, res) => {
    try {
        const profiles = await patientService.findAllProfiles();
        res.json({ success: true, profiles });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    }
}

module.exports = { savePatientProfile, getPatientProfile, deletePatientProfile, getAllProfiles };
