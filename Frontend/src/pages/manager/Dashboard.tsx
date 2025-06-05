import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useEngineersStore } from '@/store/engineersStore';
import { useProjectsStore } from '@/store/projectsStore';
import { useAssignmentsStore } from '@/store/assignmentsStore';
import { Users, FolderOpen, Calendar, TrendingUp } from 'lucide-react';
import { CapacityBar } from '@/components/ui/CapacityBar';
import api from '@/api/axios';

interface EngineerCapacity {
  _id: string;
  name: string;
  maxCapacity: number;
  currentAllocation: number;
  availableCapacity: number;
  assignments: Array<{
    projectName: string;
    allocationPercentage: number;
    startDate: string;
    endDate: string;
    role: string;
    status: string;
    projectId: {
      _id: string;
      status: string;
    };
  }>;
}

const ManagerDashboard = () => {
  const { engineers, loading: engineersLoading, fetchEngineers } = useEngineersStore();
  const { projects, loading: projectsLoading, fetchProjects } = useProjectsStore();
  const { assignments, loading: assignmentsLoading, fetchAssignments } = useAssignmentsStore();
  const [engineerCapacities, setEngineerCapacities] = useState<Record<string, EngineerCapacity>>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        await Promise.all([
          fetchEngineers(),
          fetchProjects(),
          fetchAssignments()
        ]);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };
    fetchData();
  }, [fetchEngineers, fetchProjects, fetchAssignments]);

  // Fetch capacity data for each engineer
  useEffect(() => {
    const fetchEngineerCapacities = async () => {
      if (engineers && engineers.length > 0) {
        try {
          const capacityPromises = engineers.map(engineer =>
            api.get(`/api/engineers/${engineer._id}/capacity`)
              .then(response => response.data.data.engineer)
              .catch(error => {
                console.error(`Error fetching capacity for ${engineer.name}:`, error);
                return null;
              })
          );

          const capacities = await Promise.all(capacityPromises);
          const capacityMap = capacities.reduce((acc, capacity) => {
            if (capacity) {
              acc[capacity._id] = capacity;
            }
            return acc;
          }, {} as Record<string, EngineerCapacity>);

          setEngineerCapacities(capacityMap);
        } catch (error) {
          console.error('Error fetching engineer capacities:', error);
        }
      }
    };

    fetchEngineerCapacities();
  }, [engineers]);

  const isLoading = engineersLoading || projectsLoading || assignmentsLoading;

  // Calculate average utilization based on active assignments only
  const avgUtilization = engineers?.length > 0
    ? Math.round(
        engineers.reduce((sum, engineer) => {
          const capacity = engineerCapacities[engineer._id];
          return sum + (capacity?.currentAllocation || 0);
        }, 0) / engineers.length
      )
    : 0;

  const stats = {
    totalEngineers: engineers?.length || 0,
    activeProjects: projects?.filter(p => p.status === 'active').length || 0,
    totalAssignments: assignments?.length || 0,
    utilizationRate: avgUtilization,
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="text-center py-8">Loading dashboard data...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Manager Dashboard</h1>
        <p className="text-gray-600 mt-2">Overview of your engineering resources and projects</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Engineers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEngineers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeProjects}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assignments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAssignments}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Utilization</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.utilizationRate}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Team Utilization */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Team Utilization</CardTitle>
            <CardDescription>
              Current workload distribution across engineers
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {engineers?.slice(0, 5).map((engineer) => {
              const capacity = engineerCapacities[engineer._id];
              return (
                <div key={engineer._id} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{engineer.name}</span>
                    <span className="text-sm text-gray-500">{engineer.seniority}</span>
                  </div>
                  <div className="space-y-1">
                    <CapacityBar 
                      current={capacity?.currentAllocation || 0} 
                      max={capacity?.maxCapacity || 100} 
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{capacity?.currentAllocation || 0}% allocated</span>
                      <span>{capacity?.availableCapacity || 100}% available</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Projects</CardTitle>
            <CardDescription>
              Latest project status updates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {projects?.slice(0, 5).map((project) => (
                <div key={project._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{project.name}</p>
                    <p className="text-sm text-gray-600">
                      {project.currentTeamSize}/{project.requiredTeamSize} team members
                    </p>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    project.status === 'active' ? 'bg-green-100 text-green-800' :
                    project.status === 'planning' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {project.status}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ManagerDashboard;
