require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;
const connectDB = require('./config/mongodb');

// Connect to Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

const userRouter = require('./routes/userRoute');
app.use('/api/user', userRouter);

// Basic Route
app.get('/', (req, res) => {
  res.send('HelloDoctor Backend is running!');
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
