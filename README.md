# Engineering Resource Management System

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit%20App-blue)](https://engineering-resource-ma-git-4aa489-shanmukhas-projects-009da9a3.vercel.app/)

## Sample User Credentials

### Manager Account
```
Email: alice.johnson@example.com
Password: password123
```

### Engineer Account
```
Email: john.doe@example.com
Password: password123
```

A comprehensive system for managing engineering resources, projects, and assignments.

## Tech Stack

### Frontend
- React with TypeScript
- Vite as build tool
- Zustand for state management
- Axios for API calls
- Tailwind CSS for styling
- Shadcn UI components

### Backend
- Node.js with Express
- MongoDB with Mongoose
- JWT for authentication
- CORS for cross-origin requests
- Bcrypt for password hashing

## Development Tools & AI Assistance

### UI Development
- **Lovable AI**: Used for generating UI components and design inspiration
- **Cursor IDE**: Primary development environment for frontend code
- **Shadcn UI**: Component library for consistent design

### Backend Development
- **ChatGPT**: Used for prompt generation and code development assistance
- **Cursor IDE**: Primary development environment for backend code
- **MongoDB Compass**: Database management and visualization

### Integration & Development
- **ChatGPT**: Assisted with API integration and code development
- **Cursor IDE**: Used for code completion, refactoring, and debugging
- **Postman**: API testing and documentation

## Features

### Authentication
- Email/password authentication
- JWT token storage
- Role-based access control (Manager/Engineer)
- Protected routes

### Manager Dashboard
- Overview statistics
- Team utilization
- Active projects
- Assignment tracking

### Engineer Management
- Engineers list
- Capacity management
- Skills tracking
- Department assignment

### Project Management
- Projects list
- Project details
- Team composition
- Resource allocation

### Assignment Management
- Assignment creation
- Assignment tracking
- Capacity impact
- Status updates

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   # Frontend
   cd frontend
   npm install

   # Backend
   cd backend
   npm install
   ```

3. Set up environment variables:
   ```env
   # Frontend (.env)
   VITE_API_URL=http://localhost:5000

   # Backend (.env)
   PORT=5000
   MONGODB_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   ```

4. Start the development servers:
   ```bash
   # Frontend
   npm run dev

   # Backend
   npm run dev
   ```

## Deployment

### Frontend
- Built with Vite
- Deployed on Vercel
- Environment variables configured in Vercel dashboard
- Fast and reliable hosting with global CDN
- Automatic deployments on git push

### Backend
- Node.js server
- Deployed on Render
- Environment variables configured in Render dashboard
- **Note**: The application may experience slower response times due to Render's free tier limitations:
  - Cold starts after periods of inactivity
  - Limited CPU and memory resources
  - Shared infrastructure constraints
  - Network latency for certain regions

## Performance Considerations

The application's performance may vary based on the following factors:

1. **Backend Response Time**:
   - Initial cold start delay (15-30 seconds) after inactivity
   - Subsequent requests are faster but may still be slower than production-grade hosting
   - Database operations may take longer due to shared resources

2. **Frontend Performance**:
   - Fast loading times due to Vercel's global CDN
   - Optimized bundle size and code splitting
   - Efficient caching strategies

3. **Recommendations for Production**:
   - Consider upgrading to Render's paid tier for better performance
   - Implement caching strategies for frequently accessed data
   - Use connection pooling for database operations
   - Consider implementing a CDN for static assets

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

