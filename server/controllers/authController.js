// controllers/authController.js
// Register, login, and "who am I".

const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { generateToken, httpError, publicUser } = require('../utils/helpers');

// POST /api/auth/register  (public, students only)
const register = asyncHandler(async (req, res) => {
  const { name, email, rollNo, department, year, phone, password, confirmPassword } = req.body;

  if (!name || !email || !rollNo || !department || !year || !phone || !password) {
    throw httpError(400, 'All fields are required');
  }
  if (confirmPassword !== undefined && password !== confirmPassword) {
    throw httpError(400, 'Passwords do not match');
  }

  // Friendly duplicate checks (the unique index is the final safety net)
  if (await User.findOne({ email: email.toLowerCase().trim() })) {
    throw httpError(400, 'This email is already registered');
  }
  if (await User.findOne({ rollNo: rollNo.toUpperCase().trim() })) {
    throw httpError(400, 'This roll number is already registered');
  }

  // role is forced to 'student' so nobody can register as admin
  const user = await User.create({
    name,
    email,
    rollNo,
    department,
    year: Number(year),
    phone,
    password,
    role: 'student',
  });

  res.status(201).json({ token: generateToken(user._id), user: publicUser(user) });
});

// POST /api/auth/login  (public)
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw httpError(400, 'Email and password are required');

  // password has select:false, so ask for it explicitly
  const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');

  // Same message for both cases so attackers can't guess which emails exist
  if (!user || !(await user.matchPassword(password))) {
    throw httpError(401, 'Invalid email or password');
  }

  res.json({ token: generateToken(user._id), user: publicUser(user) });
});

// GET /api/auth/me  (logged in)
const getMe = asyncHandler(async (req, res) => {
  res.json({ user: publicUser(req.user) });
});

module.exports = { register, login, getMe };
