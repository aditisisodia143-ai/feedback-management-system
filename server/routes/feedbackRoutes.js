const express = require('express');
const {
  createFeedback,
  getReceived,
  getGiven,
  updateOwnFeedback,
  deleteOwnFeedback,
} = require('../controllers/feedbackController');
const { protect, studentOnly } = require('../middleware/auth');

const router = express.Router();

router.use(protect, studentOnly);

router.post('/', createFeedback);
router.get('/received', getReceived);
router.get('/given', getGiven);
router.put('/:id', updateOwnFeedback);
router.delete('/:id', deleteOwnFeedback);

module.exports = router;
