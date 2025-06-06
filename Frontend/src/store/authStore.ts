import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '@/api/axios';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'engineer' | 'manager';
  skills?: string[];
  maxCapacity?: number;
  seniority?: 'junior' | 'mid' | 'senior';
  department?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  fetchProfile: () => Promise<void>;
  updateProfile: (profileData: Partial<User>) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: localStorage.getItem('authToken'),
      isAuthenticated: !!localStorage.getItem('authToken'),

      login: async (email: string, password: string) => {
        try {
          const response = await api.post('/api/auth/login', { email, password });
          console.log('Login response:', response.data);
          
          // Handle different response formats
          let token, user;
          if (response.data.data) {
            // New format with nested data
            ({ token, user } = response.data.data);
          } else {
            // Direct format
            token = response.data.token;
            user = response.data.user;
          }
          
          if (!token) {
            throw new Error('No token received from server');
          }
          
          localStorage.setItem('authToken', token);
          
          // Set user data if available, otherwise fetch profile
          if (user) {
            set({ token, user: { ...user, id: user._id || user.id }, isAuthenticated: true });
          } else {
            set({ token, isAuthenticated: true });
          }
          
          // Always fetch full profile to ensure we have complete user data
          await get().fetchProfile();
        } catch (error) {
          console.error('Login failed:', error);
          throw error;
        }
      },

      register: async (userData: any) => {
        try {
          const response = await api.post('/api/auth/register', userData);
          console.log('Register response:', response.data);
          
          // Handle different response formats
          let token, user;
          if (response.data.data) {
            // New format with nested data
            ({ token, user } = response.data.data);
          } else {
            // Direct format
            token = response.data.token;
            user = response.data.user;
          }
          
          if (!token) {
            throw new Error('No token received from server');
          }
          
          localStorage.setItem('authToken', token);
          
          // Set user data if available
          if (user) {
            set({ token, user: { ...user, id: user._id || user.id }, isAuthenticated: true });
          } else {
            set({ token, isAuthenticated: true });
          }
          
          // Fetch full profile after registration
          await get().fetchProfile();
        } catch (error) {
          console.error('Registration failed:', error);
          throw error;
        }
      },

      logout: () => {
        localStorage.removeItem('authToken');
        set({ user: null, token: null, isAuthenticated: false });
      },

      fetchProfile: async () => {
        try {
          const response = await api.get('/api/auth/profile');
          console.log('Profile response:', response.data);
          
          // Handle different response formats
          let user;
          if (response.data.data?.user) {
            // New format with nested data
            user = response.data.data.user;
          } else if (response.data.data) {
            // Direct data format
            user = response.data.data;
          } else {
            // Direct user format
            user = response.data;
          }
          
          if (user) {
            set({ user: { ...user, id: user._id || user.id } });
          }
        } catch (error) {
          console.error('Failed to fetch profile:', error);
          get().logout();
        }
      },

      updateProfile: async (profileData) => {
        try {
          const response = await api.put('/api/auth/profile', profileData);
          console.log('Update profile response:', response.data);
          
          // Handle different response formats
          let user;
          if (response.data.data?.user) {
            // New format with nested data
            user = response.data.data.user;
          } else if (response.data.data) {
            // Direct data format
            user = response.data.data;
          } else {
            // Direct user format
            user = response.data;
          }
          
          if (user) {
            set({ user: { ...user, id: user._id || user.id } });
          }
        } catch (error) {
          console.error('Failed to update profile:', error);
          throw error;
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token, isAuthenticated: state.isAuthenticated }),
    }
  )
);
