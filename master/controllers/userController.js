const userModel = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// API to register user
const registerUser = async (req, res) => {
    try {
        const { name, email, password, phone, role, department, dob, age } = req.body;

        // Validation for required fields
        if (!name || !email || !password || !phone || !role) {
            return res.status(400).json({ success: false, message: "Missing Details" });
        }

        // Specific validation based on role
        if (role === 'doctor' && !department) {
            return res.status(400).json({ success: false, message: "Department is required for doctors" });
        }
        if (role === 'patient' && (!dob || !age)) {
            return res.status(400).json({ success: false, message: "Date of Birth and Age are required for patients" });
        }

        // Check if user already exists (by email)
        const exists = await userModel.findOne({ email });
        if (exists) {
           return res.status(400).json({ success: false, message: "User already exists" });
        }

        // Hashing user password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user data object
        const userData = {
            name,
            email,
            password: hashedPassword,
            phone,
            role,
            ...(role === 'doctor' && { department }),
            ...(role === 'patient' && { dob, age })
        };

        const newUser = new userModel(userData);
        const user = await newUser.save();

        // If user is a patient, initialize their profile with a unique patientId
        if (role === 'patient') {
            const patientService = require('../../patient/services/patientService');
            await patientService.saveOrUpdateProfile(user._id, {
                patientId: await patientService.generateUniquePatientId(),
                basicInfo: {
                    fullName: name, // User registration wala name yahan bhi jayega
                    gender: "", 
                    address: ""
                },
                metaData: {
                    memberSince: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                }
            });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

        res.status(200).json({ success: true, token, message: "User Registered Successfully" });

    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    }
}

// API for user login
const loginUser = async (req, res) => {
    try {
        const { email, phone, password } = req.body;
        let user;

        if (email) {
            // Login with Email and Password
            user = await userModel.findOne({ email });
            if (!user) {
                return res.status(404).json({ success: false, message: "User does not exist" });
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(401).json({ success: false, message: "Invalid credentials" });
            }
        } else if (phone) {
            // Login with Phone Number (Direct match)
            user = await userModel.findOne({ phone });
            if (!user) {
                return res.status(404).json({ success: false, message: "Phone number not registered" });
            }
        } else {
            return res.status(400).json({ success: false, message: "Please provide email or phone number" });
        }

        // Generate Token and respond
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
        
        // Prepare user data response
        const userData = {
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            dob: user.dob,
            age: user.age,
            department: user.department
        };

        // If user is a patient, fetch and include their profile
        let patientProfile = null;
        if (user.role === 'patient') {
            const patientService = require('../../patient/services/patientService');
            patientProfile = await patientService.findProfileByUserId(user._id);
        }

        res.json({ 
            success: true, 
            token, 
            user: userData,
            profile: patientProfile, // Patient profile data (null for doctors)
            message: "Login successful" 
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    }
}

// API to get all users or filter by role (doctor/patient)
const getAllUsers = async (req, res) => {
    try {
        const { role } = req.query;
        let filter = {};
        
        if (role) {
            filter.role = role;
        }

        const users = await userModel.find(filter).select('-password');
        res.json({ success: true, count: users.length, users });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    }
}

// API to get a single user by ID
const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await userModel.findById(id).select('-password');
        
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.json({ success: true, user });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    }
}

module.exports = { registerUser, loginUser, getAllUsers, getUserById };
