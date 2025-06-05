const Assignment = require('../models/Assignment');
const User = require('../models/User');
const Project = require('../models/Project');

// @desc    Get all assignments
// @route   GET /api/assignments
// @access  Private
exports.getAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.find()
      .populate('engineerId', 'name email skills')
      .populate('projectId', 'name description');

    res.status(200).json({
      success: true,
      count: assignments.length,
      data: assignments
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};

// @desc    Get single assignment
// @route   GET /api/assignments/:id
// @access  Private
exports.getAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate('engineerId', 'name email skills')
      .populate('projectId', 'name description');

    if (!assignment) {
      return res.status(404).json({
        success: false,
        error: 'Assignment not found'
      });
    }

    res.status(200).json({
      success: true,
      data: assignment
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};

// @desc    Create new assignment
// @route   POST /api/assignments
// @access  Private
exports.createAssignment = async (req, res) => {
  try {
    const { engineerId, projectId, allocationPercentage, startDate, endDate, role } = req.body;

    // Check if engineer exists
    const engineer = await User.findOne({ _id: engineerId, role: 'engineer' });
    if (!engineer) {
      return res.status(404).json({
        success: false,
        error: 'Engineer not found'
      });
    }

    // Check if project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    // Check if assignment dates are within project dates
    if (new Date(startDate) < new Date(project.startDate) || 
        new Date(endDate) > new Date(project.endDate)) {
      return res.status(400).json({
        success: false,
        error: 'Assignment dates must be within project dates'
      });
    }

    // Check if engineer has enough capacity
    const existingAssignments = await Assignment.find({
      engineerId,
      $or: [
        {
          startDate: { $lte: endDate },
          endDate: { $gte: startDate }
        }
      ]
    });

    const totalAllocation = existingAssignments.reduce(
      (sum, assignment) => sum + assignment.allocationPercentage,
      0
    );

    if (totalAllocation + allocationPercentage > engineer.maxCapacity) {
      return res.status(400).json({
        success: false,
        error: 'Engineer does not have enough capacity for this assignment'
      });
    }

    const assignment = await Assignment.create(req.body);

    res.status(201).json({
      success: true,
      data: assignment
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};

// @desc    Update assignment
// @route   PUT /api/assignments/:id
// @access  Private
exports.updateAssignment = async (req, res) => {
  try {
    let assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({
        success: false,
        error: 'Assignment not found'
      });
    }

    // Check if engineer has enough capacity for the update
    if (req.body.allocationPercentage) {
      const engineer = await User.findOne({ _id: assignment.engineerId, role: 'engineer' });
      
      const existingAssignments = await Assignment.find({
        engineerId: assignment.engineerId,
        _id: { $ne: assignment._id },
        $or: [
          {
            startDate: { $lte: req.body.endDate || assignment.endDate },
            endDate: { $gte: req.body.startDate || assignment.startDate }
          }
        ]
      });

      const totalAllocation = existingAssignments.reduce(
        (sum, assignment) => sum + assignment.allocationPercentage,
        0
      );

      if (totalAllocation + req.body.allocationPercentage > engineer.maxCapacity) {
        return res.status(400).json({
          success: false,
          error: 'Engineer does not have enough capacity for this assignment'
        });
      }
    }

    assignment = await Assignment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: assignment
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};

// @desc    Delete assignment
// @route   DELETE /api/assignments/:id
// @access  Private
exports.deleteAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({
        success: false,
        error: 'Assignment not found'
      });
    }

    await assignment.remove();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
}; 