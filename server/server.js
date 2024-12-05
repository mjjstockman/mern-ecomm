require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const helmet = require('helmet');

const connectionString = process.env.MONGO_CONNECTION_STRING;
const PORT = process.env.PORT || 5001;

if (!connectionString) {
  console.error('MONGO_CONNECTION_STRING is not defined');
  process.exit(1);
}

mongoose
  .connect(connectionString)
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

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

app.get('/api/test', (_, res) => {
  res.status(200).send('using SuperTest');
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

process.on('SIGINT', () => {
  mongoose.connection.close(() => {
    console.log('App terminated and MongoDB connection closed');
    process.exit(0);
  });
});

module.exports = app;
