const doctorService = require('../services/doctorService');
const notificationModel = require('../model/notificationModel');

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

// API to get all doctor profiles (with optional city filter)
const getAllDoctorProfiles = async (req, res) => {
    try {
        const { city } = req.query;
        const profiles = await doctorService.findAllProfiles();

        // If city filter is provided, sort: city-matched first, then others
        if (city && city.trim()) {
            const cityLower = city.trim().toLowerCase();
            const matched = [];
            const others = [];

            profiles.forEach(p => {
                const clinic = (p.basicInfo?.clinic || '').toLowerCase();
                if (clinic.includes(cityLower)) {
                    matched.push(p);
                } else {
                    others.push(p);
                }
            });

            return res.json({
                success: true,
                count: profiles.length,
                matchedCity: city.trim(),
                matchedCount: matched.length,
                profiles: [...matched, ...others],
            });
        }

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

// ============================
// NOTIFICATION APIs
// ============================

// Create a notification for a doctor (called when patient books appointment)
const createNotification = async (req, res) => {
    try {
        const { doctorUserId, type, title, message, appointmentData } = req.body;

        if (!doctorUserId || !title || !message) {
            return res.status(400).json({ success: false, message: "doctorUserId, title, and message are required" });
        }

        const notification = await notificationModel.create({
            doctorUserId,
            type: type || 'appointment_booked',
            title,
            message,
            appointmentData: appointmentData || {},
        });

        console.log(`📩 Notification created for doctor ${doctorUserId}: ${title}`);

        res.json({ success: true, message: "Notification sent successfully", notification });

    } catch (error) {
        console.log('Notification error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
}

// Get all notifications for a doctor
const getDoctorNotifications = async (req, res) => {
    try {
        const userId = req.userId || req.query.userId;

        if (!userId) {
            return res.status(400).json({ success: false, message: "userId is required" });
        }

        const notifications = await notificationModel
            .find({ doctorUserId: userId })
            .sort({ createdAt: -1 })
            .limit(50);

        const unreadCount = await notificationModel.countDocuments({ doctorUserId: userId, read: false });

        res.json({ success: true, notifications, unreadCount });

    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    }
}

// Mark notification(s) as read
const markNotificationsRead = async (req, res) => {
    try {
        const { notificationIds, userId } = req.body;

        if (notificationIds && notificationIds.length > 0) {
            // Mark specific notifications
            await notificationModel.updateMany(
                { _id: { $in: notificationIds } },
                { $set: { read: true } }
            );
        } else if (userId) {
            // Mark all notifications for this doctor as read
            await notificationModel.updateMany(
                { doctorUserId: userId, read: false },
                { $set: { read: true } }
            );
        }

        res.json({ success: true, message: "Notifications marked as read" });

    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    }
}

module.exports = { 
    saveDoctorProfile, 
    getDoctorProfile, 
    getAllDoctorProfiles, 
    deleteDoctorProfile,
    createNotification,
    getDoctorNotifications,
    markNotificationsRead,
};

