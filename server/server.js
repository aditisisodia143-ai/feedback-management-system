// server.js
// Entry point: loads env vars, connects the DB, sets up Express, starts the server.

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Allow the frontend (local + deployed) to call this API
const allowedOrigins = [
  'http://localhost:5173', // Vite dev server
  process.env.CLIENT_URL, // deployed Vercel URL, e.g. https://peer-feedback.vercel.app
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // allow tools like Postman (no origin) and our listed frontends
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error('Not allowed by CORS'));
    },
  })
);

app.use(express.json()); // read JSON request bodies

// Health check, also handy to wake up Render before a demo
app.get('/', (req, res) => {
  res.json({ message: 'Peer Feedback API is running' });
});

// API routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/students', require('./routes/studentRoutes'));
app.use('/api/feedback', require('./routes/feedbackRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// 404 for unknown routes
app.use((req, res) => {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
});

// Central error handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Start the server only when this file is run directly (node server.js)
if (require.main === module) {
  connectDB().then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  });
}

module.exports = app;
