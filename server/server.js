require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const helmet = require('helmet');
const admin = require('firebase-admin');

const connectionString = process.env.MONGO_CONNECTION_STRING;
const PORT = process.env.PORT || 5001;

// MongoDB Connection
if (!connectionString) {
  console.error('MONGO_CONNECTION_STRING is not defined');
  process.exit(1);
}

mongoose
  .connect(connectionString)
  .then(() => {
    if (process.env.NODE_ENV !== 'test') {
      console.log('MongoDB connected successfully');
    }
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Firebase Admin Initialization
if (!admin.apps.length) {
  admin.initializeApp();
}

// Express App Setup
const app = express();

app.use(helmet());
app.use(
  cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Cache-Control',
      'Expires',
      'Pragma'
    ],
    credentials: true
  })
);
app.use(cookieParser());
app.use(express.json());

// Test Route
app.get('/api/test', (_, res) => {
  res.status(200).send('using SuperTest');
});

// Login Route
app.post('/api/login', async (req, res) => {
  const { token } = req.body;

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    const uid = decodedToken.uid;

    res.status(200).send({
      message: 'Login successful',
      uid: uid
    });
  } catch (error) {
    res.status(401).send({
      error: 'Unauthorised'
    });
  }
});

// Server Start (only when run directly)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

// Graceful Shutdown
process.on('SIGINT', () => {
  mongoose.connection.close(() => {
    console.log('App terminated and MongoDB connection closed');
    process.exit(0);
  });
});

// Export for Testing
module.exports = app;
