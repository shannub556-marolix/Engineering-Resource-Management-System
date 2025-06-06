# Engineering Resource Management System - Frontend Documentation

## Technology Stack
- React with TypeScript
- Vite as build tool
- Zustand for state management
- Axios for API calls
- Tailwind CSS for styling
- Shadcn UI components

## Project Structure
```
frontend/
├── src/
│   ├── api/         # API configuration and services
│   ├── components/  # Reusable UI components
│   ├── hooks/       # Custom React hooks
│   ├── lib/         # Utility functions and configurations
│   ├── pages/       # Page components
│   ├── store/       # Zustand state management
│   └── types/       # TypeScript type definitions
```

## Key Features

### 1. Authentication
- **Login Page**
  - Email/password authentication
  - JWT token storage
  - Role-based access control (Manager/Engineer)
  - Protected routes

- **Registration**
  - New user registration
  - Role selection
  - Department assignment
  - Skills input

### 2. Manager Dashboard
- **Overview Statistics**
  - Total engineers count
  - Active projects count
  - Total assignments
  - Average utilization rate

- **Team Utilization**
  - Top 5 engineers by availability
  - Capacity visualization
  - Color-coded availability status
  - Assignment timeline view

- **Recent Projects**
  - active projects
  - Team size tracking
  - Project status indicators
  - Quick project details

### 3. Engineer Management
- **Engineers List**
  - CRUD operations for engineers
  - Skills and seniority tracking
  - Capacity management
  - Department assignment

- **Capacity Management**
  - Real-time capacity tracking
  - Allocation percentage
  - Available capacity calculation
  - Assignment history

### 4. Project Management
- **Projects List**
  - Project creation and editing
  - Status tracking
  - Team size management
  - Project timeline

- **Project Details**
  - Team composition
  - Resource allocation
  - Project timeline
  - Status updates

### 5. Assignment Management
- **Assignment Creation**
  - Engineer selection
  - Project assignment
  - Allocation percentage
  - Timeline setting

- **Assignment Tracking**
  - Current assignments view
  - Historical assignments
  - Capacity impact
  - Status updates

## State Management
- **Zustand Stores**
  - `authStore`: Authentication state
  - `engineersStore`: Engineer data and operations
  - `projectsStore`: Project data and operations
  - `assignmentsStore`: Assignment data and operations

## API Integration
- **Axios Configuration**
  - Base URL configuration
  - Authentication headers
  - Error handling
  - Request/response interceptors

## UI Components
- **Custom Components**
  - `CapacityBar`: Visual capacity representation
  - `AssignmentTimeline`: Timeline visualization
  - `ViewTeamDialog`: Team composition view
  - `CreateAssignmentDialog`: Assignment creation

## Responsive Design
- Mobile-first approach
- Responsive layouts
- Adaptive components
- Touch-friendly interfaces

## Error Handling
- Form validation
- API error handling
- User feedback
- Error boundaries

## Performance Optimizations
- Lazy loading
- Memoization
- Optimized re-renders
- Efficient state updates

## Security Features
- JWT authentication
- Protected routes
- Role-based access
- Secure API calls

## Environment Configuration
- Development/Production environments
- API URL configuration
- Environment variables
- Build optimization 