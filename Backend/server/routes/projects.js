const express = require('express');
const {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  findSuitableEngineers
} = require('../controllers/projectController');
const { protect, authorize } = require('../middleware/authMiddleware');
const Project = require('../models/Project');

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(getProjects)
  .post(authorize('manager'), createProject);

router
  .route('/:id')
  .get(getProject)
  .put(authorize('manager'), updateProject)
  .delete(authorize('manager'), async (req, res) => {
    try {
      const project = await Project.findById(req.params.id);
      
      if (!project) {
        return res.status(404).json({ 
          success: false,
          error: 'Project not found' 
        });
      }

      // Check if user is the project manager
      if (project.managerId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ 
          success: false,
          error: 'Not authorized to delete this project' 
        });
      }

      // Delete the project using findByIdAndDelete
      await Project.findByIdAndDelete(req.params.id);
      
      res.json({ 
        success: true,
        data: {
          message: 'Project deleted successfully'
        }
      });
    } catch (error) {
      console.error('Delete project error:', error);
      res.status(500).json({ 
        success: false,
        error: 'Error deleting project' 
      });
    }
  });

router.get('/:id/suitable-engineers', findSuitableEngineers);

module.exports = router; 