const mongoose = require('mongoose');

const AssignmentSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  engineerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  allocationPercentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  role: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Add index for faster queries
AssignmentSchema.index({ engineerId: 1 });
AssignmentSchema.index({ projectId: 1 });

// Validate that end date is after start date
AssignmentSchema.pre('save', function(next) {
  if (this.endDate <= this.startDate) {
    next(new Error('End date must be after start date'));
  }
  next();
});

// Validate that allocation percentage doesn't exceed engineer's max capacity
AssignmentSchema.pre('save', async function(next) {
  const Engineer = mongoose.model('User');
  const engineer = await Engineer.findById(this.engineerId);
  
  if (!engineer) {
    return next(new Error('Engineer not found'));
  }

  const Assignment = mongoose.model('Assignment');
  const currentAssignments = await Assignment.find({
    engineerId: this.engineerId,
    _id: { $ne: this._id }
  });

  const totalAllocation = currentAssignments.reduce((sum, assignment) => 
    sum + assignment.allocationPercentage, 0) + this.allocationPercentage;

  if (totalAllocation > engineer.maxCapacity) {
    return next(new Error('Total allocation exceeds engineer\'s maximum capacity'));
  }

  next();
});

module.exports = mongoose.model('Assignment', AssignmentSchema); 