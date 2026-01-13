const userModel = require('../models/userModel');
const bcrypt = require('bcrypt');

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
        await newUser.save();

        res.json({ success: true, message: "User Registered Successfully" });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

module.exports = { registerUser };
