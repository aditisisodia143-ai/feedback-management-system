// middleware/errorHandler.js
// One place that turns every error into a clean JSON message.

const errorHandler = (err, req, res, next) => {
  let status = err.statusCode || 500;
  let message = err.message || 'Server error';

  // Mongoose validation failed (e.g. wrong roll no format)
  if (err.name === 'ValidationError') {
    status = 400;
    message = Object.values(err.errors)[0].message;
  }

  // Duplicate value on a unique field / index
  if (err.code === 11000) {
    status = 400;
    const field = Object.keys(err.keyPattern || {})[0];
    if (field === 'email') message = 'This email is already registered';
    else if (field === 'rollNo') message = 'This roll number is already registered';
    else message = 'You have already given feedback in this category to this student';
  }

  // Invalid MongoDB id in the URL
  if (err.name === 'CastError') {
    status = 400;
    message = 'Invalid id';
  }

  if (status === 500) console.error(err);
  res.status(status).json({ message });
};

module.exports = errorHandler;
