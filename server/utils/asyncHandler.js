// utils/asyncHandler.js
// Wraps async route functions so any error goes to our error handler
// (saves us writing try/catch in every controller).

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
