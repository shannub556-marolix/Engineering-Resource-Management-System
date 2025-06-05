const express = require('express');
const {
  getAssignments,
  getAssignment,
  createAssignment,
  updateAssignment,
  deleteAssignment
} = require('../controllers/assignmentController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(getAssignments)
  .post(authorize('manager'), createAssignment);

router
  .route('/:id')
  .get(getAssignment)
  .put(authorize('manager'), updateAssignment)
  .delete(authorize('manager'), deleteAssignment);

module.exports = router; 