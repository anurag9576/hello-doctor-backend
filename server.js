require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.disable('x-powered-by');
const PORT = process.env.PORT || 5000;
const connectDB = require('./config/mongodb');

// Connect to Database
connectDB();

// Middleware
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((origin) => origin.trim())
  : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:8081'];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, Postman) or whitelisted origins
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

const userRouter = require('./routes/userRoute');
const patientRouter = require('./routes/patientRoute');
const doctorRouter = require('./routes/doctorRoute');

app.use('/api/user', userRouter);
app.use('/api/patient', patientRouter);
app.use('/api/doctor', doctorRouter);

// Basic Route
app.get('/', (req, res) => {
  res.send('HelloDoctor Backend is running!');
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
