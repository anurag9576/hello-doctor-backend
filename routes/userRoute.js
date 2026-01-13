const express = require('express');
const { registerUser } = require('../master/controllers/userController');

const userRouter = express.Router();

// register a new user (Doctor or Patient)
userRouter.post('/register', registerUser);

module.exports = userRouter;
