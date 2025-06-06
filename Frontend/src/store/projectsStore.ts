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

export interface Project {
  _id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  requiredSkills: string[];
  teamSize: number;
  currentTeamSize: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface ProjectsState {
  projects: Project[];
  loading: boolean;
  error: string | null;
  fetchProjects: () => Promise<void>;
  createProject: (project: {
    name: string;
    description: string;
    startDate: string;
    endDate: string;
    status: string;
    teamSize: number;
    requiredSkills: string[];
    currentTeamSize: number;
  }) => Promise<void>;
  updateProject: (id: string, project: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  getSuitableEngineers: (projectId: string) => Promise<any[]>;
}

export const useProjectsStore = create<ProjectsState>((set) => ({
  projects: [],
  loading: false,
  error: null,

  fetchProjects: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get(`${import.meta.env.VITE_API_URL}/api/projects`);
      console.log('Projects response:', response.data);
      
      if (response.data.success) {
        set((state) => ({
          ...state,
          projects: response.data.data,
          loading: false,
          error: null,
        }));
      } else {
        set((state) => ({
          ...state,
          loading: false,
          error: response.data.message || 'Failed to fetch projects',
        }));
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      set({ error: 'Failed to fetch projects', loading: false });
    }
  },

  createProject: async (project) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/api/projects', project);
      if (response.data.success) {
        set(state => ({
          projects: [...state.projects, response.data.data],
          loading: false
        }));
      } else {
        set({ error: 'Failed to create project', loading: false });
      }
    } catch (error) {
      console.error('Error creating project:', error);
      set({ error: 'Failed to create project', loading: false });
    }
  },

  updateProject: async (id, project) => {
    set({ loading: true, error: null });
    try {
      const response = await api.put(`/api/projects/${id}`, project);
      if (response.data.success) {
        set(state => ({
          projects: state.projects.map(p => 
            p._id === id ? { ...p, ...response.data.data } : p
          ),
          loading: false
        }));
      } else {
        set({ error: 'Failed to update project', loading: false });
      }
    } catch (error) {
      console.error('Error updating project:', error);
      set({ error: 'Failed to update project', loading: false });
    }
  },

  deleteProject: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await api.delete(`/api/projects/${id}`);
      if (response.data.success) {
        set(state => ({
          projects: state.projects.filter(p => p._id !== id),
          loading: false
        }));
      } else {
        set({ error: 'Failed to delete project', loading: false });
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      set({ error: 'Failed to delete project', loading: false });
    }
  },

  getSuitableEngineers: async (projectId) => {
    try {
      const response = await api.get(`/api/projects/${projectId}/suitable-engineers`);
      if (response.data.success) {
        return response.data.data;
      }
      return [];
    } catch (error) {
      console.error('Error getting suitable engineers:', error);
      return [];
    }
  }
}));
