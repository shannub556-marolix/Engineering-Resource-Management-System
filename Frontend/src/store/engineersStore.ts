import { create } from 'zustand';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface Engineer {
  _id: string;
  name: string;
  email: string;
  skills: string[];
  seniority: string;
  department: string;
  maxCapacity: number;
}

interface EngineersState {
  engineers: Engineer[];
  loading: boolean;
  error: string | null;
  fetchEngineers: () => Promise<void>;
  createEngineer: (engineer: Omit<Engineer, '_id'>) => Promise<void>;
  updateEngineer: (id: string, engineer: Partial<Engineer>) => Promise<void>;
  deleteEngineer: (id: string) => Promise<void>;
}

export const useEngineersStore = create<EngineersState>((set, get) => ({
  engineers: [],
  loading: false,
  error: null,

  fetchEngineers: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get('/api/engineers');
      console.log('Engineers response:', response.data);
      if (response.data.success) {
        set({ engineers: response.data.data.engineers, loading: false });
      } else {
        set({ loading: false, error: response.data.error });
      }
    } catch (error: any) {
      console.error('Error fetching engineers:', error);
      set({ loading: false, error: error.response?.data?.error || 'Failed to fetch engineers' });
    }
  },

  createEngineer: async (engineer) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/api/engineers', engineer);
      if (response.data.success) {
        set((state) => ({
          ...state,
          engineers: [...state.engineers, response.data.data.engineer],
          loading: false,
        }));
      } else {
        set({ loading: false, error: response.data.error });
      }
    } catch (error: any) {
      set({ loading: false, error: error.response?.data?.error || 'Failed to create engineer' });
    }
  },

  updateEngineer: async (id, engineer) => {
    set({ loading: true, error: null });
    try {
      const response = await api.put(`/api/engineers/${id}`, engineer);
      if (response.data.success) {
        set((state) => ({
          ...state,
          engineers: state.engineers.map((e) =>
            e._id === id ? { ...e, ...response.data.data.engineer } : e
          ),
          loading: false,
        }));
      } else {
        set({ loading: false, error: response.data.error });
      }
    } catch (error: any) {
      set({ loading: false, error: error.response?.data?.error || 'Failed to update engineer' });
    }
  },

  deleteEngineer: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await api.delete(`/api/engineers/${id}`);
      if (response.data.success) {
        set((state) => ({
          ...state,
          engineers: state.engineers.filter((e) => e._id !== id),
          loading: false,
        }));
      } else {
        set({ loading: false, error: response.data.error });
      }
    } catch (error: any) {
      set({ loading: false, error: error.response?.data?.error || 'Failed to delete engineer' });
    }
  },
}));
