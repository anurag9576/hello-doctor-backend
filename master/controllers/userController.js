const userModel = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// API to register user
const registerUser = async (req, res) => {
    try {
        const { name, email, password, phone, role, department, dob, age } = req.body;

        // Validation for required fields
        if (!name || !email || !password || !phone || !role) {
            return res.json({ success: false, message: "Missing Details" });
        }

        // Specific validation based on role
        if (role === 'doctor' && !department) {
            return res.json({ success: false, message: "Department is required for doctors" });
        }
        if (role === 'patient' && (!dob || !age)) {
            return res.json({ success: false, message: "Date of Birth and Age are required for patients" });
        }

        // Check if user already exists (by email)
        const exists = await userModel.findOne({ email });
        if (exists) {
           return res.json({ success: false, message: "User already exists" });
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

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

        res.json({ success: true, token, message: "User Registered Successfully" });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
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
                return res.json({ success: false, message: "User does not exist" });
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.json({ success: false, message: "Invalid credentials" });
            }
        } else if (phone) {
            // Login with Phone Number (Direct match)
            user = await userModel.findOne({ phone });
            if (!user) {
                return res.json({ success: false, message: "Phone number not registered" });
            }
        } else {
            return res.json({ success: false, message: "Please provide email or phone number" });
        }

        // Generate Token and respond
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
        res.json({ 
            success: true, 
            token, 
            role: user.role, 
            name: user.name,
            message: `login successful, ${user.name}` 
        });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

module.exports = { registerUser, loginUser };
