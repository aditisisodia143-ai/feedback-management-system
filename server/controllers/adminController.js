// controllers/adminController.js
// Admin moderation: all feedback, all students, dashboard stats.

const Feedback = require('../models/Feedback');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { httpError, escapeRegex, publicUser, average } = require('../utils/helpers');
const { ensureCategoryFree } = require('./feedbackController');

const STUDENT_FIELDS = 'name rollNo department year';

// GET /api/admin/feedback?search=&category=&rating=
// Admin always sees the real giver, even for anonymous feedback.
const getAllFeedback = asyncHandler(async (req, res) => {
  const { search, category, rating } = req.query;
  const filter = {};

  if (category) filter.category = category;
  if (rating) filter.rating = Number(rating);

  if (search) {
    // Find students whose name or roll no matches, then match feedback given BY or TO them
    const regex = new RegExp(escapeRegex(search.trim()), 'i');
    const ids = await User.find({ $or: [{ name: regex }, { rollNo: regex }] }).distinct('_id');
    filter.$or = [{ givenBy: { $in: ids } }, { givenTo: { $in: ids } }];
  }

  const feedbacks = await Feedback.find(filter)
    .populate('givenBy', STUDENT_FIELDS)
    .populate('givenTo', STUDENT_FIELDS)
    .sort({ createdAt: -1 });

  res.json(feedbacks);
});

// PUT /api/admin/feedback/:id  -> edit category, rating, comment
const updateFeedback = asyncHandler(async (req, res) => {
  const feedback = await Feedback.findById(req.params.id);
  if (!feedback) throw httpError(404, 'Feedback not found');

  const { category, rating, comment } = req.body;
  if (category !== undefined && category !== feedback.category) {
    await ensureCategoryFree(feedback, category);
    feedback.category = category;
  }
  if (rating !== undefined) feedback.rating = Number(rating);
  if (comment !== undefined) feedback.comment = comment;

  await feedback.save();
  await feedback.populate([
    { path: 'givenBy', select: STUDENT_FIELDS },
    { path: 'givenTo', select: STUDENT_FIELDS },
  ]);
  res.json(feedback);
});

// DELETE /api/admin/feedback/:id
const deleteFeedback = asyncHandler(async (req, res) => {
  const feedback = await Feedback.findById(req.params.id);
  if (!feedback) throw httpError(404, 'Feedback not found');
  await feedback.deleteOne();
  res.json({ message: 'Feedback deleted' });
});

// GET /api/admin/students
const getAllStudents = asyncHandler(async (req, res) => {
  const students = await User.find({ role: 'student' }).sort({ name: 1 });

  // count feedback received / given for each student
  const [received, given] = await Promise.all([
    Feedback.aggregate([{ $group: { _id: '$givenTo', count: { $sum: 1 }, total: { $sum: '$rating' } } }]),
    Feedback.aggregate([{ $group: { _id: '$givenBy', count: { $sum: 1 } } }]),
  ]);
  const recMap = Object.fromEntries(received.map((r) => [r._id.toString(), r]));
  const givMap = Object.fromEntries(given.map((g) => [g._id.toString(), g.count]));

  res.json(
    students.map((s) => ({
      ...publicUser(s),
      feedbackReceived: recMap[s._id]?.count || 0,
      feedbackGiven: givMap[s._id] || 0,
      avgRating: recMap[s._id] ? average(recMap[s._id].total, recMap[s._id].count) : 0,
    }))
  );
});

// DELETE /api/admin/students/:id  -> removes student + feedback they GAVE and RECEIVED
const deleteStudent = asyncHandler(async (req, res) => {
  const student = await User.findById(req.params.id);
  if (!student || student.role !== 'student') throw httpError(404, 'Student not found');

  const { deletedCount } = await Feedback.deleteMany({
    $or: [{ givenBy: student._id }, { givenTo: student._id }],
  });
  await student.deleteOne();

  res.json({ message: `Deleted ${student.name} and ${deletedCount} related feedback` });
});

// GET /api/admin/stats
const getStats = asyncHandler(async (req, res) => {
  const [totalStudents, totalFeedback, perStudent] = await Promise.all([
    User.countDocuments({ role: 'student' }),
    Feedback.countDocuments(),
    // total rating + count of feedback received, per student
    Feedback.aggregate([
      { $group: { _id: '$givenTo', total: { $sum: '$rating' }, count: { $sum: 1 } } },
    ]),
  ]);

  // Overall average rating across all feedback
  const grandTotal = perStudent.reduce((sum, s) => sum + s.total, 0);
  const averageRating = average(grandTotal, totalFeedback);

  // Top 3: highest average among students with at least 2 feedback
  // (min 2 so one lucky 5-star doesn't top the list)
  const ranked = perStudent
    .filter((s) => s.count >= 2)
    .map((s) => ({ ...s, avgRating: average(s.total, s.count) }))
    .sort((a, b) => b.avgRating - a.avgRating || b.count - a.count)
    .slice(0, 3);

  const topStudents = await User.find({ _id: { $in: ranked.map((r) => r._id) } });
  const topRated = ranked.map((r) => {
    const s = topStudents.find((u) => u._id.equals(r._id));
    return {
      _id: r._id,
      name: s?.name,
      rollNo: s?.rollNo,
      department: s?.department,
      avgRating: r.avgRating,
      feedbackCount: r.count,
    };
  });

  res.json({ totalStudents, totalFeedback, averageRating, topRated });
});

module.exports = {
  getAllFeedback,
  updateFeedback,
  deleteFeedback,
  getAllStudents,
  deleteStudent,
  getStats,
};
