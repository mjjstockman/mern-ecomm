require('dotenv').config();

const express = require('express')
const mongoose = require('mongoose')
const cookieParser = require('cookie-parser')
const cors = require('cors')

const connectionString = process.env.MONGO_CONNECTION_STRING;

if (!connectionString) {
  console.error('MONGO_CONNECTION_STRING is not defined');
  process.exit(1);
}

mongoose.connect(connectionString)
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.log('MongoDB connection error:', err));

const app = express()
const PORT = process.env.PORT || 5001

app.use(
    cors({
        origin : 'http://localhost:5173',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: [
            'Content-Type',
            'Authorization',
            'Cache-Control',
            'Expires',
            'Pragma',
        ],
        credentials: true,
    })
)

app.use(cookieParser());
app.use(express.json());

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));