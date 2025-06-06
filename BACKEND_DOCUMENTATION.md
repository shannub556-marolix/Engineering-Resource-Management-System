# Engineering Resource Management System - Backend Documentation

## Technology Stack
- Node.js with Express
- MongoDB with Mongoose
- JWT for authentication
- CORS for cross-origin requests
- Bcrypt for password hashing

## Project Structure
```
backend/
├── server/
│   ├── controllers/  # Request handlers
│   ├── models/       # Database models
│   ├── routes/       # API routes
│   ├── middleware/   # Custom middleware
│   ├── seed/         # Database seed data
│   └── server.js     # Main application file
```

## API Endpoints

### 1. Authentication
- **POST /api/auth/register**
  - Register new user
  - Required fields: email, password, name, role
  - Optional fields: skills, seniority, department

- **POST /api/auth/login**
  - User authentication
  - Returns JWT token
  - Role-based access

- **GET /api/auth/profile**
  - Get user profile
  - Protected route
  - Role-specific data

### 2. Engineer Management
- **GET /api/engineers**
  - List all engineers
  - Filtering options
  - Pagination support

- **POST /api/engineers**
  - Create new engineer
  - Manager only
  - Validation checks

- **GET /api/engineers/:id**
  - Get engineer details
  - Assignment history
  - Capacity information

- **PUT /api/engineers/:id**
  - Update engineer
  - Manager only
  - Validation checks

- **DELETE /api/engineers/:id**
  - Delete engineer
  - Manager only
  - Assignment checks

### 3. Project Management
- **GET /api/projects**
  - List all projects
  - Status filtering
  - Team size tracking

- **POST /api/projects**
  - Create new project
  - Manager only
  - Team size validation

- **GET /api/projects/:id**
  - Get project details
  - Team composition
  - Timeline information

- **PUT /api/projects/:id**
  - Update project
  - Manager only
  - Status management

- **DELETE /api/projects/:id**
  - Delete project
  - Manager only
  - Assignment checks

### 4. Assignment Management
- **GET /api/assignments**
  - List all assignments
  - Filtering options
  - Engineer/Project filtering

- **POST /api/assignments**
  - Create new assignment
  - Manager only
  - Capacity validation

- **GET /api/assignments/:id**
  - Get assignment details
  - Timeline information
  - Status tracking

- **PUT /api/assignments/:id**
  - Update assignment
  - Manager only
  - Capacity checks

- **DELETE /api/assignments/:id**
  - Delete assignment
  - Manager only
  - Status checks

## Database Models

### 1. User Model
```javascript
{
  email: String,
  password: String,
  name: String,
  role: String,
  skills: [String],
  seniority: String,
  department: String,
  maxCapacity: Number
}
```

### 2. Project Model
```javascript
{
  name: String,
  description: String,
  status: String,
  teamSize: Number,
  currentTeamSize: Number,
  startDate: Date,
  endDate: Date
}
```

### 3. Assignment Model
```javascript
{
  engineerId: ObjectId,
  projectId: ObjectId,
  allocationPercentage: Number,
  startDate: Date,
  endDate: Date,
  role: String,
  status: String
}
```

## Middleware

### 1. Authentication
- JWT verification
- Role checking
- Token refresh

### 2. Validation
- Request body validation
- Data type checking
- Business rule validation

### 3. Error Handling
- Global error handler
- Custom error types
- Error logging

## Security Features
- Password hashing
- JWT authentication
- CORS configuration
- Rate limiting
- Input sanitization

## Performance Optimizations
- Database indexing
- Query optimization
- Connection pooling
- Response compression

## Environment Configuration
- Development/Production settings
- Database connection
- JWT secrets
- CORS origins

## Error Handling
- HTTP status codes
- Error messages
- Validation errors
- Database errors

## API Response Format
```javascript
{
  success: boolean,
  data: object | array,
  error: string | null
}
```

## Deployment
- Environment variables
- Database connection
- CORS configuration
- Error logging
- Performance monitoring 