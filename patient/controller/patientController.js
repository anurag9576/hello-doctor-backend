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
        // Accept userId from query params, body, or from the auth middleware
        const userId = req.userId || req.query.userId || req.body.userId;
        
        if (!userId) {
            return res.status(400).json({ success: false, message: "userId is required" });
        }
        
        let profile = await patientService.findProfileByUserId(userId);
        
        if (!profile) {
            console.log(`Profile not found for userId: ${userId}. Attempting to initialize...`);
            // Profile missing? Let's check if the user exists in UserMaster
            const userModel = require('../../master/models/userModel');
            const user = await userModel.findById(userId);
            
            if (!user) {
                return res.status(404).json({ success: false, message: "User not found" });
            }

            if (user.role !== 'patient') {
                return res.status(400).json({ success: false, message: "User is not a patient" });
            }

            // Create a default profile for the existing user
            profile = await patientService.saveOrUpdateProfile(userId, {
                patientId: await patientService.generateUniquePatientId(),
                basicInfo: {
                    fullName: user.name,
                    gender: "",
                    address: ""
                },
                metaData: {
                    memberSince: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                }
            });

            console.log(`Successfully initialized profile for ${user.name}`);
        }

        // Merge UserMaster common data with profile data
        const response = {
            success: true,
            data: {
                // Common data from UserMaster (populated)
                userId: profile.userId?._id || profile.userId,
                name: profile.userId?.name || null,
                email: profile.userId?.email || null,
                phone: profile.userId?.phone || null,
                dob: profile.userId?.dob || null,
                age: profile.userId?.age || null,
                role: profile.userId?.role || 'patient',
                
                // Patient specific data
                patientId: profile.patientId,
                basicInfo: profile.basicInfo,
                emergencyContact: profile.emergencyContact,
                medicalInfo: profile.medicalInfo,
                currentHealth: profile.currentHealth,
                lifestyle: profile.lifestyle,
                insurance: profile.insurance,
                metaData: profile.metaData,
                createdAt: profile.createdAt,
                updatedAt: profile.updatedAt
            }
        };

        res.json(response);

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
        
        // Merge UserMaster common data with each profile
        const formattedProfiles = profiles.map(profile => ({
            // Common data from UserMaster (populated)
            userId: profile.userId?._id || profile.userId,
            name: profile.userId?.name || null,
            email: profile.userId?.email || null,
            phone: profile.userId?.phone || null,
            dob: profile.userId?.dob || null,
            age: profile.userId?.age || null,
            role: profile.userId?.role || 'patient',
            
            // Patient specific data
            patientId: profile.patientId,
            basicInfo: profile.basicInfo,
            emergencyContact: profile.emergencyContact,
            medicalInfo: profile.medicalInfo,
            currentHealth: profile.currentHealth,
            lifestyle: profile.lifestyle,
            insurance: profile.insurance,
            metaData: profile.metaData,
            createdAt: profile.createdAt,
            updatedAt: profile.updatedAt
        }));
        
        res.json({ success: true, count: formattedProfiles.length, profiles: formattedProfiles });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    }
}

module.exports = { savePatientProfile, getPatientProfile, deletePatientProfile, getAllProfiles };
