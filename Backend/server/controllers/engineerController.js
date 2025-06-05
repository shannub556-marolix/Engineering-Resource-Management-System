const User = require('../models/User');
const Assignment = require('../models/Assignment');

// @desc    Get all engineers
// @route   GET /api/engineers
// @access  Private
exports.getEngineers = async (req, res) => {
  try {
    const engineers = await User.find({ role: 'engineer' });

    // Get capacity information for each engineer
    const engineersWithCapacity = await Promise.all(
      engineers.map(async (engineer) => {
        // Get all assignments for this engineer
        const assignments = await Assignment.find({
          engineerId: engineer._id
        }).populate('projectId', 'name');

        // Calculate total allocation from active assignments only
        const activeAssignments = assignments.filter(assignment => assignment.status === 'active');
        const totalAllocated = activeAssignments.reduce(
          (sum, assignment) => sum + assignment.allocationPercentage,
          0
        );

        // Calculate available capacity
        const availableCapacity = Math.max(0, engineer.maxCapacity - totalAllocated);

        return {
          _id: engineer._id,
          name: engineer.name,
          email: engineer.email,
          skills: engineer.skills,
          seniority: engineer.seniority,
          department: engineer.department,
          maxCapacity: engineer.maxCapacity,
          currentAllocation: totalAllocated,
          availableCapacity: availableCapacity,
          assignments: assignments.map(assignment => ({
            projectName: assignment.projectId.name,
            allocationPercentage: assignment.allocationPercentage,
            startDate: assignment.startDate,
            endDate: assignment.endDate,
            role: assignment.role,
            status: assignment.status
          }))
        };
      })
    );

    res.status(200).json({
      success: true,
      data: {
        engineers: engineersWithCapacity
      }
    });
  } catch (err) {
    console.error('Error in getEngineers:', err);
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};

// @desc    Get single engineer
// @route   GET /api/engineers/:id
// @access  Private
exports.getEngineer = async (req, res) => {
  try {
    const engineer = await User.findOne({
      _id: req.params.id,
      role: 'engineer'
    });

    if (!engineer) {
      return res.status(404).json({
        success: false,
        error: 'Engineer not found'
      });
    }

    res.status(200).json({
      success: true,
      data: engineer
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};

// @desc    Get engineer's capacity
// @route   GET /api/engineers/:id/capacity
// @access  Private
exports.getEngineerCapacity = async (req, res) => {
  try {
    const engineer = await User.findOne({
      _id: req.params.id,
      role: 'engineer'
    });

    if (!engineer) {
      return res.status(404).json({
        success: false,
        error: 'Engineer not found'
      });
    }

    // Get all assignments for the engineer with project details
    const assignments = await Assignment.find({
      engineerId: req.params.id
    }).populate({
      path: 'projectId',
      select: 'name status'
    });

    console.log('Found assignments:', assignments);

    // Calculate total allocation from active assignments only
    const activeAssignments = assignments.filter(assignment => 
      assignment.projectId && 
      assignment.projectId.status === 'active'
    );
    
    console.log('Active assignments:', activeAssignments);
    
    const totalAllocated = activeAssignments.reduce(
      (sum, assignment) => sum + assignment.allocationPercentage,
      0
    );

    console.log('Total allocated:', totalAllocated);
    console.log('Max capacity:', engineer.maxCapacity);

    const availableCapacity = Math.max(0, engineer.maxCapacity - totalAllocated);

    const response = {
      success: true,
      data: {
        engineer: {
          _id: engineer._id,
          name: engineer.name,
          maxCapacity: engineer.maxCapacity,
          currentAllocation: totalAllocated,
          availableCapacity: availableCapacity,
          assignments: assignments.map(assignment => ({
            projectName: assignment.projectId.name,
            allocationPercentage: assignment.allocationPercentage,
            startDate: assignment.startDate,
            endDate: assignment.endDate,
            role: assignment.role,
            status: assignment.projectId.status,
            projectId: {
              _id: assignment.projectId._id,
              status: assignment.projectId.status
            }
          }))
        }
      }
    };

    console.log('Sending response:', response);
    res.status(200).json(response);
  } catch (err) {
    console.error('Error in getEngineerCapacity:', err);
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};

// @desc    Update engineer
// @route   PUT /api/engineers/:id
// @access  Private
exports.updateEngineer = async (req, res) => {
  try {
    const engineer = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'engineer' },
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!engineer) {
      return res.status(404).json({
        success: false,
        error: 'Engineer not found'
      });
    }

    res.status(200).json({
      success: true,
      data: engineer
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};

// @desc    Delete engineer
// @route   DELETE /api/engineers/:id
// @access  Private
exports.deleteEngineer = async (req, res) => {
  try {
    const engineer = await User.findOneAndDelete({
      _id: req.params.id,
      role: 'engineer'
    });

    if (!engineer) {
      return res.status(404).json({
        success: false,
        error: 'Engineer not found'
      });
    }

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

// @desc    Create new engineer
// @route   POST /api/engineers
// @access  Private
exports.createEngineer = async (req, res) => {
  try {
    // Set role to engineer
    req.body.role = 'engineer';

    const engineer = await User.create(req.body);

    res.status(201).json({
      success: true,
      data: engineer
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
}; 