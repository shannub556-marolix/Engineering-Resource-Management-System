const express = require('express');
const {
  getEngineers,
  getEngineer,
  getEngineerCapacity,
  updateEngineer,
  deleteEngineer,
  createEngineer
} = require('../controllers/engineerController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(getEngineers)
  .post(authorize('manager'), createEngineer);

router
  .route('/:id')
  .get(getEngineer)
  .put(authorize('manager'), updateEngineer)
  .delete(authorize('manager'), deleteEngineer);

// Get engineer capacity
router.get('/:id/capacity', getEngineerCapacity);

module.exports = router; 