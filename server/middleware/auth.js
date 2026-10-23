// middleware/auth.js
// Security guards that run BEFORE a route's controller.

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { httpError } = require('../utils/helpers');

// protect: only lets the request through if it has a valid JWT
// Frontend sends it as header -> Authorization: Bearer <token>
const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    throw httpError(401, 'Not logged in. Please log in first.');
  }

  const token = header.split(' ')[1];
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw httpError(401, 'Session expired or invalid. Please log in again.');
  }

  const user = await User.findById(decoded.id);
  if (!user) throw httpError(401, 'User no longer exists.');

  req.user = user; // controllers can now use req.user
  next();
});

// adminOnly: must come AFTER protect
const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') return next(httpError(403, 'Admin access only.'));
  next();
};

// studentOnly: must come AFTER protect
const studentOnly = (req, res, next) => {
  if (req.user.role !== 'student') return next(httpError(403, 'Student access only.'));
  next();
};

module.exports = { protect, adminOnly, studentOnly };
