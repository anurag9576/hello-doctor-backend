const express = require('express');
const { registerUser, loginUser } = require('../master/controllers/userController');

const userRouter = express.Router();

// register a new user (Doctor or Patient)
userRouter.post('/register', registerUser);

// Login user (Doctor or Patient)
userRouter.post('/login', loginUser);

module.exports = userRouter;
