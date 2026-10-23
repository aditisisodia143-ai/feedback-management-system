// models/Feedback.js
// One feedback = one student rating another student in one category.

const mongoose = require('mongoose');

const CATEGORIES = [
  'Technical Skills',
  'Communication',
  'Teamwork',
  'Behaviour',
  'Leadership',
  'Punctuality',
];

const feedbackSchema = new mongoose.Schema(
  {
    givenTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // links to the User collection
      required: [true, 'Receiver is required'],
    },
    givenBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Giver is required'],
    },
    category: {
      type: String,
      enum: { values: CATEGORIES, message: 'Invalid category' },
      required: [true, 'Category is required'],
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be between 1 and 5'],
      max: [5, 'Rating must be between 1 and 5'],
    },
    comment: {
      type: String,
      required: [true, 'Comment is required'],
      trim: true,
      maxlength: [500, 'Comment cannot exceed 500 characters'],
    },
    isAnonymous: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// A student can give only ONE feedback per category to the same person
feedbackSchema.index({ givenBy: 1, givenTo: 1, category: 1 }, { unique: true });

const Feedback = mongoose.model('Feedback', feedbackSchema);

module.exports = Feedback;
module.exports.CATEGORIES = CATEGORIES;
