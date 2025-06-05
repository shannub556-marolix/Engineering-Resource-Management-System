
import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Auth components
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuthStore } from '@/store/authStore';

// Layouts
import { ManagerLayout } from '@/components/layout/ManagerLayout';
import { EngineerLayout } from '@/components/layout/EngineerLayout';

// Pages
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Unauthorized from '@/pages/Unauthorized';

// Manager pages
import ManagerDashboard from '@/pages/manager/Dashboard';
import EngineersPage from '@/pages/manager/Engineers';
import ProjectsPage from '@/pages/manager/Projects';
import AssignmentsPage from '@/pages/manager/Assignments';

// Engineer pages
import EngineerDashboard from '@/pages/engineer/Dashboard';
import EngineerAssignments from '@/pages/engineer/Assignments';

const queryClient = new QueryClient();

const App = () => {
  const { isAuthenticated, user, token, fetchProfile } = useAuthStore();

  useEffect(() => {
    // Initialize auth state from localStorage and fetch profile if token exists
    const storedToken = localStorage.getItem('authToken');
    if (storedToken && !user) {
      fetchProfile();
    }
  }, [user, fetchProfile]);

  const RoleBasedRedirect = () => {
    if (!user) return <div>Loading...</div>;
    
    if (user.role === 'manager') {
      return <Navigate to="/manager/dashboard" replace />;
    } else if (user.role === 'engineer') {
      return <Navigate to="/engineer/dashboard" replace />;
    }
    
    return <Navigate to="/unauthorized" replace />;
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Root redirect */}
          <Route
            path="/"
            element={
              isAuthenticated ? <RoleBasedRedirect /> : <Navigate to="/login" replace />
            }
          />

          {/* Manager routes */}
          <Route
            path="/manager/*"
            element={
              <ProtectedRoute allowedRoles={['manager']}>
                <ManagerLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<ManagerDashboard />} />
            <Route path="engineers" element={<EngineersPage />} />
            <Route path="projects" element={<ProjectsPage />} />
            <Route path="assignments" element={<AssignmentsPage />} />
          </Route>

          {/* Engineer routes */}
          <Route
            path="/engineer/*"
            element={
              <ProtectedRoute allowedRoles={['engineer']}>
                <EngineerLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<EngineerDashboard />} />
            <Route path="assignments" element={<EngineerAssignments />} />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
