const express = require('express');
const {
  getAllFeedback,
  updateFeedback,
  deleteFeedback,
  getAllStudents,
  deleteStudent,
  getStats,
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.use(protect, adminOnly); // every route below is admin-only

router.get('/stats', getStats);
router.get('/feedback', getAllFeedback);
router.put('/feedback/:id', updateFeedback);
router.delete('/feedback/:id', deleteFeedback);
router.get('/students', getAllStudents);
router.delete('/students/:id', deleteStudent);

module.exports = router;
