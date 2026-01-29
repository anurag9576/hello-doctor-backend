const express = require('express');
const { registerUser, loginUser, getAllUsers, getUserById, removeUser } = require('../master/controllers/userController');

const userRouter = express.Router();

// 1. Static Routes (Ye pehle aane chahiye)
userRouter.get('/all-users', getAllUsers);

// Get all doctors
userRouter.get('/all-doctors', (req, res) => {
    req.query.role = 'doctor';
    getAllUsers(req, res);
});

// Get all patients
userRouter.get('/all-patients', (req, res) => {
    req.query.role = 'patient';
    getAllUsers(req, res);
});

// Auth Routes
userRouter.post('/register', registerUser);
userRouter.post('/login', loginUser);

// 2. Dynamic Routes (Ye sabse neeche hone chahiye)
userRouter.post('/delete-user', removeUser);
userRouter.get('/:id', getUserById);

module.exports = userRouter;
