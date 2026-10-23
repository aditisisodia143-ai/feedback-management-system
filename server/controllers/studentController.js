// controllers/studentController.js
// Students directory and single student profile.

const User = require('../models/User');
const Feedback = require('../models/Feedback');
const asyncHandler = require('../utils/asyncHandler');
const { httpError, escapeRegex, publicUser, average } = require('../utils/helpers');

// GET /api/students?search=&department=&year=
// Lists all students except the logged-in user and the admin.
const getStudents = asyncHandler(async (req, res) => {
  const { search, department, year } = req.query;

  const filter = { role: 'student', _id: { $ne: req.user._id } };

  if (search) {
    const regex = new RegExp(escapeRegex(search.trim()), 'i'); // case-insensitive
    filter.$or = [{ name: regex }, { rollNo: regex }];
  }
  if (department) filter.department = department;
  if (year) filter.year = Number(year);

  const students = await User.find(filter).sort({ name: 1 });

  // Attach each student's average rating and feedback count
  const stats = await Feedback.aggregate([
    { $match: { givenTo: { $in: students.map((s) => s._id) } } },
    { $group: { _id: '$givenTo', totalRating: { $sum: '$rating' }, count: { $sum: 1 } } },
  ]);
  const statsMap = Object.fromEntries(stats.map((s) => [s._id.toString(), s]));

  res.json(
    students.map((s) => ({
      ...publicUser(s),
      avgRating: statsMap[s._id] ? average(statsMap[s._id].totalRating, statsMap[s._id].count) : 0,
      feedbackCount: statsMap[s._id]?.count || 0,
    }))
  );
});

// GET /api/students/:id  -> profile + average rating
const getStudentById = asyncHandler(async (req, res) => {
  const student = await User.findById(req.params.id);
  if (!student || student.role !== 'student') throw httpError(404, 'Student not found');

  const feedbacks = await Feedback.find({ givenTo: student._id });
  const count = feedbacks.length;
  const total = feedbacks.reduce((sum, f) => sum + f.rating, 0);

  // Which categories has the logged-in user already rated? (to disable them in the form)
  const alreadyGiven = await Feedback.find({
    givenTo: student._id,
    givenBy: req.user._id,
  }).distinct('category');

  res.json({
    ...publicUser(student),
    avgRating: average(total, count),
    feedbackCount: count,
    alreadyGivenCategories: alreadyGiven,
  });
});

module.exports = { getStudents, getStudentById };
