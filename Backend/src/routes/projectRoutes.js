const express = require('express');
const Project = require('../models/project');
const Assignment = require('../models/assignment');

const router = express.Router();

router.delete('/:id', async (req, res) => {
  try {
    const projectId = req.params.id;
    
    // First delete all assignments associated with this project
    await Assignment.deleteMany({ projectId: projectId });
    
    // Then delete the project
    const deletedProject = await Project.findByIdAndDelete(projectId);
    
    if (!deletedProject) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    res.json({ message: 'Project and associated assignments deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ message: 'Error deleting project' });
  }
});

module.exports = router; 