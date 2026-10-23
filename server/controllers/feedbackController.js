// controllers/feedbackController.js
// Student actions on feedback: give, view received, view given, edit/delete own.

const Feedback = require('../models/Feedback');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { httpError } = require('../utils/helpers');

const STUDENT_FIELDS = 'name rollNo department year';

// POST /api/feedback
const createFeedback = asyncHandler(async (req, res) => {
  const { givenTo, category, rating, comment, isAnonymous } = req.body;

  if (!givenTo) throw httpError(400, 'Please choose a student');

  // Rule 1: no feedback to yourself
  if (givenTo === req.user._id.toString()) {
    throw httpError(400, 'You cannot give feedback to yourself');
  }

  // Rule 2: receiver must be a real student (not admin)
  const receiver = await User.findById(givenTo);
  if (!receiver || receiver.role !== 'student') throw httpError(404, 'Student not found');

  // Rule 3: one feedback per category per student
  const exists = await Feedback.findOne({ givenBy: req.user._id, givenTo, category });
  if (exists) {
    throw httpError(400, `You have already given "${category}" feedback to ${receiver.name}`);
  }

  const feedback = await Feedback.create({
    givenTo,
    givenBy: req.user._id,
    category,
    rating: Number(rating),
    comment,
    isAnonymous: Boolean(isAnonymous),
  });

  res.status(201).json(feedback);
});

// GET /api/feedback/received  -> feedback about me (anonymous givers hidden)
const getReceived = asyncHandler(async (req, res) => {
  const feedbacks = await Feedback.find({ givenTo: req.user._id })
    .populate('givenBy', STUDENT_FIELDS)
    .sort({ createdAt: -1 });

  const result = feedbacks.map((f) => {
    const obj = f.toObject();
    if (obj.isAnonymous) obj.givenBy = null; // remove giver's identity completely
    return obj;
  });

  res.json(result);
});

// GET /api/feedback/given  -> feedback I wrote
const getGiven = asyncHandler(async (req, res) => {
  const feedbacks = await Feedback.find({ givenBy: req.user._id })
    .populate('givenTo', STUDENT_FIELDS)
    .sort({ createdAt: -1 });
  res.json(feedbacks);
});

// Finds feedback and checks the logged-in student wrote it
const findOwnFeedback = async (id, userId) => {
  const feedback = await Feedback.findById(id);
  if (!feedback) throw httpError(404, 'Feedback not found');
  if (feedback.givenBy.toString() !== userId.toString()) {
    throw httpError(403, 'You can only change feedback you gave');
  }
  return feedback;
};

// When changing a feedback's category, make sure the giver hasn't already
// used that category for the same student (keeps the one-per-category rule)
const ensureCategoryFree = async (feedback, newCategory) => {
  const clash = await Feedback.findOne({
    _id: { $ne: feedback._id },
    givenBy: feedback.givenBy,
    givenTo: feedback.givenTo,
    category: newCategory,
  });
  if (clash) throw httpError(400, `A "${newCategory}" feedback already exists for this student`);
};

// PUT /api/feedback/:id  -> edit my own feedback
const updateOwnFeedback = asyncHandler(async (req, res) => {
  const feedback = await findOwnFeedback(req.params.id, req.user._id);
  const { category, rating, comment, isAnonymous } = req.body;

  if (category !== undefined && category !== feedback.category) {
    await ensureCategoryFree(feedback, category);
    feedback.category = category;
  }
  if (rating !== undefined) feedback.rating = Number(rating);
  if (comment !== undefined) feedback.comment = comment;
  if (isAnonymous !== undefined) feedback.isAnonymous = Boolean(isAnonymous);

  await feedback.save(); // runs validation + duplicate index check
  await feedback.populate('givenTo', STUDENT_FIELDS);
  res.json(feedback);
});

// DELETE /api/feedback/:id  -> delete my own feedback
const deleteOwnFeedback = asyncHandler(async (req, res) => {
  const feedback = await findOwnFeedback(req.params.id, req.user._id);
  await feedback.deleteOne();
  res.json({ message: 'Feedback deleted' });
});

module.exports = {
  createFeedback,
  getReceived,
  getGiven,
  updateOwnFeedback,
  deleteOwnFeedback,
  ensureCategoryFree,
};
