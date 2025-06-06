import { create } from 'zustand';
import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Add request interceptor to include auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

interface Assignment {
  _id: string;
  engineerId: {
    _id: string;
    name: string;
    email: string;
    skills: string[];
  };
  projectId: {
    _id: string;
    name: string;
    description: string;
  };
  allocationPercentage: number;
  startDate: string;
  endDate: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

interface AssignmentsState {
  assignments: Assignment[];
  loading: boolean;
  error: string | null;
  fetchAssignments: () => Promise<void>;
  createAssignment: (assignment: {
    engineerId: string;
    projectId: string;
    allocationPercentage: number;
    startDate: string;
    endDate: string;
    role: string;
  }) => Promise<void>;
  updateAssignment: (id: string, assignment: Partial<Assignment>) => Promise<void>;
  deleteAssignment: (id: string) => Promise<void>;
}

export const useAssignmentsStore = create<AssignmentsState>((set, get) => ({
  assignments: [],
  loading: false,
  error: null,

  fetchAssignments: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get('/api/assignments');
      console.log('Assignments response:', response.data);
      if (response.data.success) {
        set((state) => ({
          ...state,
          assignments: response.data.data,
          loading: false,
          error: null,
        }));
      } else {
        set((state) => ({
          ...state,
          loading: false,
          error: response.data.message || 'Failed to fetch assignments',
        }));
      }
    } catch (error) {
      set((state) => ({
        ...state,
        loading: false,
        error: 'Failed to fetch assignments',
      }));
    }
  },

  createAssignment: async (assignment) => {
    set({ loading: true, error: null });
    try {
      console.log('Sending assignment data:', assignment);
      const response = await api.post('/api/assignments', {
        engineerId: assignment.engineerId,
        projectId: assignment.projectId,
        allocationPercentage: assignment.allocationPercentage,
        startDate: assignment.startDate,
        endDate: assignment.endDate,
        role: assignment.role
      });
      if (response.data.success) {
        set((state) => ({
          ...state,
          assignments: [...state.assignments, response.data.data.assignment],
          loading: false,
          error: null,
        }));
      } else {
        set((state) => ({
          ...state,
          loading: false,
          error: response.data.message || 'Failed to create assignment',
        }));
      }
    } catch (error: any) {
      console.error('Error creating assignment:', error.response?.data || error.message);
      set((state) => ({
        ...state,
        loading: false,
        error: error.response?.data?.error || 'Failed to create assignment',
      }));
    }
  },

  updateAssignment: async (id, assignment) => {
    set({ loading: true, error: null });
    try {
      const response = await api.put(`/api/assignments/${id}`, assignment);
      if (response.data.success) {
        set((state) => ({
          ...state,
          assignments: state.assignments.map(a => 
            a._id === id ? { ...a, ...response.data.data.assignment } : a
          ),
          loading: false,
          error: null,
        }));
      } else {
        set((state) => ({
          ...state,
          loading: false,
          error: response.data.message || 'Failed to update assignment',
        }));
      }
    } catch (error) {
      set((state) => ({
        ...state,
        loading: false,
        error: 'Failed to update assignment',
      }));
    }
  },

  deleteAssignment: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await api.delete(`/api/assignments/${id}`);
      if (response.data.success) {
        set((state) => ({
          ...state,
          assignments: state.assignments.filter(a => a._id !== id),
          loading: false,
          error: null,
        }));
      } else {
        set((state) => ({
          ...state,
          loading: false,
          error: response.data.message || 'Failed to delete assignment',
        }));
      }
    } catch (error) {
      set((state) => ({
        ...state,
        loading: false,
        error: 'Failed to delete assignment',
      }));
    }
  }
}));
