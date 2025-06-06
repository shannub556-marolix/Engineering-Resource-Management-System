const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Project = require('../models/Project');
const Assignment = require('../models/Assignment');

// Load env vars
dotenv.config();

// Connect to DB
mongoose.connect(process.env.MONGODB_URI);

// Sample data
const engineers = [
  {
    email: 'john.doe@example.com',
    password: 'password123',
    name: 'John Doe',
    role: 'engineer',
    skills: ['React', 'Node.js', 'MongoDB'],
    seniority: 'senior',
    maxCapacity: 100,
    department: 'Engineering'
  },
  {
    email: 'jane.smith@example.com',
    password: 'password123',
    name: 'Jane Smith',
    role: 'engineer',
    skills: ['Python', 'Django', 'PostgreSQL'],
    seniority: 'mid',
    maxCapacity: 100,
    department: 'Engineering'
  },
  {
    email: 'bob.wilson@example.com',
    password: 'password123',
    name: 'Bob Wilson',
    role: 'engineer',
    skills: ['Java', 'Spring Boot', 'MySQL'],
    seniority: 'junior',
    maxCapacity: 50,
    department: 'Engineering'
  }
];

const managers = [
  {
    email: 'alice.johnson@example.com',
    password: 'password123',
    name: 'Alice Johnson',
    role: 'manager',
    skills: ['Project Management', 'Agile'],
    seniority: 'senior',
    maxCapacity: 100,
    department: 'Engineering'
  }
];

const projects = [
  {
    name: 'E-commerce Platform',
    description: 'Building a modern e-commerce platform with React and Node.js',
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-06-30'),
    requiredSkills: ['React', 'Node.js', 'MongoDB'],
    teamSize: 5,
    status: 'active'
  },
  {
    name: 'Data Analytics Dashboard',
    description: 'Creating a real-time data analytics dashboard',
    startDate: new Date('2024-02-01'),
    endDate: new Date('2024-08-31'),
    requiredSkills: ['Python', 'Django', 'PostgreSQL'],
    teamSize: 3,
    status: 'planning'
  }
];

// Check if data exists
const checkExistingData = async () => {
  try {
    const userCount = await User.countDocuments();
    const projectCount = await Project.countDocuments();
    const assignmentCount = await Assignment.countDocuments();

    return {
      hasData: userCount > 0 || projectCount > 0 || assignmentCount > 0,
      counts: {
        users: userCount,
        projects: projectCount,
        assignments: assignmentCount
      }
    };
  } catch (err) {
    console.error('Error checking existing data:', err);
    throw err;
  }
};

// Seed function
const seed = async () => {
  try {
    // Check for existing data
    const { hasData, counts } = await checkExistingData();
    
    if (hasData) {
      console.log('Database already contains data:');
      console.log(`Users: ${counts.users}`);
      console.log(`Projects: ${counts.projects}`);
      console.log(`Assignments: ${counts.assignments}`);
      console.log('Skipping seed operation to preserve existing data.');
      process.exit(0);
    }

    console.log('No existing data found. Starting seed operation...');

    // Clear existing data
    await User.deleteMany();
    await Project.deleteMany();
    await Assignment.deleteMany();

    // Create users
    const createdEngineers = await User.create(engineers);
    const createdManagers = await User.create(managers);

    // Create projects
    const createdProjects = await Project.create(
      projects.map(project => ({
        ...project,
        managerId: createdManagers[0]._id
      }))
    );

    // Create assignments
    const assignments = [
      {
        engineerId: createdEngineers[0]._id,
        projectId: createdProjects[0]._id,
        allocationPercentage: 60,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-06-30'),
        role: 'Lead Developer'
      },
      {
        engineerId: createdEngineers[1]._id,
        projectId: createdProjects[0]._id,
        allocationPercentage: 40,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-06-30'),
        role: 'Backend Developer'
      },
      {
        engineerId: createdEngineers[2]._id,
        projectId: createdProjects[1]._id,
        allocationPercentage: 50,
        startDate: new Date('2024-02-01'),
        endDate: new Date('2024-08-31'),
        role: 'Junior Developer'
      }
    ];

    await Assignment.create(assignments);

    console.log('Database seeded successfully with:');
    console.log(`${engineers.length + managers.length} users`);
    console.log(`${projects.length} projects`);
    console.log(`${assignments.length} assignments`);
    process.exit(0);
  } catch (err) {
    console.error('Error seeding database:', err);
    process.exit(1);
  }
};

// Run seed function
seed(); 