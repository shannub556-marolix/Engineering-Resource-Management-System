export interface Engineer {
  _id: string;
  name: string;
  email: string;
  skills: string[];
  seniority: string;
  department: string;
  maxCapacity: number;
  currentAllocation: number;
  availableCapacity: number;
  assignments: {
    projectName: string;
    allocationPercentage: number;
    startDate: string;
    endDate: string;
    role: string;
    status: string;
  }[];
}

export interface Project {
  _id: string;
  name: string;
  description: string;
  status: 'planning' | 'active' | 'completed' | 'on-hold';
  startDate: string;
  endDate: string;
  currentTeamSize: number;
  requiredTeamSize: number;
  skills: string[];
  priority: 'low' | 'medium' | 'high';
  department: string;
  manager: string;
  budget: number;
  progress: number;
  createdAt: string;
  updatedAt: string;
} 