// models/User.js
// Blueprint for every user (student or admin) stored in MongoDB.

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const DEPARTMENTS = ['CSE', 'IT', 'ECE', 'CSE-AI/ML', 'ME'];
const ROLL_NO_REGEX = /^\d{2}B[A-Z]{2}\d{4}$/; // e.g. 23BCS1042

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    rollNo: {
      type: String,
      unique: true,
      uppercase: true,
      trim: true,
      // Only students need a roll number; admin doesn't
      required: [
        function () {
          return this.role === 'student';
        },
        'Roll number is required',
      ],
      match: [ROLL_NO_REGEX, 'Roll number must look like 23BCS1042'],
      sparse: true, // lets admin skip rollNo without breaking the unique index
    },
    department: {
      type: String,
      enum: { values: DEPARTMENTS, message: 'Invalid department' },
      required: [
        function () {
          return this.role === 'student';
        },
        'Department is required',
      ],
    },
    year: {
      type: Number,
      min: [1, 'Year must be between 1 and 4'],
      max: [4, 'Year must be between 1 and 4'],
      required: [
        function () {
          return this.role === 'student';
        },
        'Year is required',
      ],
    },
    phone: {
      type: String,
      match: [/^\d{10}$/, 'Phone must be exactly 10 digits'],
      required: [
        function () {
          return this.role === 'student';
        },
        'Phone is required',
      ],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // never send the password back in queries by default
    },
    role: {
      type: String,
      enum: ['student', 'admin'],
      default: 'student',
    },
  },
  { timestamps: true } // adds createdAt and updatedAt automatically
);

// Before saving, hash the password (only if it was changed)
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Helper to compare a typed password with the stored hash
userSchema.methods.matchPassword = function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
module.exports.DEPARTMENTS = DEPARTMENTS;
module.exports.ROLL_NO_REGEX = ROLL_NO_REGEX;
