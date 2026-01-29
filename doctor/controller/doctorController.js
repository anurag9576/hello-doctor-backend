const doctorService = require('../services/doctorService');

// API to save or update doctor profile
const saveDoctorProfile = async (req, res) => {
    try {
        const { userId, ...profileData } = req.body;

        if (!userId) {
            return res.status(400).json({ success: false, message: "userId is required" });
        }

        if (!profileData || Object.keys(profileData).length === 0) {
            return res.status(400).json({ success: false, message: "Missing Details" });
        }

        const profile = await doctorService.saveOrUpdateProfile(userId, profileData);
        
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

// API to get doctor profile
const getDoctorProfile = async (req, res) => {
    try {
        const userId = req.userId || req.params.userId || req.query.userId || req.body.userId;
        
        if (!userId) {
            return res.status(400).json({ success: false, message: "userId is required" });
        }
        
        let profile = await doctorService.findProfileByUserId(userId);
        
        if (!profile) {
            // Check if user exists in master and is a doctor
            const userModel = require('../../master/models/userModel');
            const user = await userModel.findById(userId);
            
            if (user && user.role === 'doctor') {
                // Auto-initialize profile if missing
                profile = await doctorService.saveOrUpdateProfile(userId, {
                    basicInfo: {
                        name: user.name,
                        specialty: user.department || "General",
                    }
                });
            } else {
                return res.status(404).json({ success: false, message: "Doctor profile not found" });
            }
        }

        res.json({
            success: true,
            profile: profile
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    }
}

// API to get all doctor profiles
const getAllDoctorProfiles = async (req, res) => {
    try {
        const profiles = await doctorService.findAllProfiles();
        res.json({ success: true, count: profiles.length, profiles });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    }
}

// API to delete doctor profile
const deleteDoctorProfile = async (req, res) => {
    try {
        const { userId } = req.body;
        
        if (!userId) {
            return res.status(400).json({ success: false, message: "userId is required" });
        }

        const deletedProfile = await doctorService.deleteProfileByUserId(userId);
        if (!deletedProfile) {
            return res.status(404).json({ success: false, message: "Profile not found" });
        }

        res.json({ success: true, message: "Doctor Profile Deleted Successfully" });

    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    }
}

module.exports = { saveDoctorProfile, getDoctorProfile, getAllDoctorProfiles, deleteDoctorProfile };
