// utils/helpers.js
// Small reusable helpers.

const jwt = require('jsonwebtoken');

// Create a JWT that stores the user's id and expires in 7 days
const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// Throw an error with an HTTP status code (caught by the error handler)
const httpError = (statusCode, message) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
};

// Make user search text safe to use inside a regex (e.g. "C++" won't crash it)
const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Average rounded to 1 decimal (returns 0 when there is no feedback)
const average = (total, count) => (count ? Math.round((total / count) * 10) / 10 : 0);

// Turn a user document into a safe object to send to the frontend
const publicUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  rollNo: user.rollNo,
  department: user.department,
  year: user.year,
  phone: user.phone,
  role: user.role,
  createdAt: user.createdAt,
});

module.exports = { generateToken, httpError, escapeRegex, average, publicUser };
