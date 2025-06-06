import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useEngineersStore } from '@/store/engineersStore';
import { useProjectsStore } from '@/store/projectsStore';
import { useAssignmentsStore } from '@/store/assignmentsStore';
import { Users, FolderOpen, Calendar, TrendingUp } from 'lucide-react';
import { CapacityBar } from '@/components/ui/CapacityBar';
import api from '@/api/axios';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead,
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { useAuthStore } from '@/store/authStore';

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

interface Project {
  _id: string;
  name: string;
  status: string;
  currentTeamSize: number;
  teamSize: number;
}

const ManagerDashboard = () => {
  const { user } = useAuthStore();
  const { engineers, loading: engineersLoading, error: engineersError, fetchEngineers } = useEngineersStore();
  const { projects, loading: projectsLoading, error: projectsError, fetchProjects } = useProjectsStore();
  const { assignments, loading: assignmentsLoading, error: assignmentsError, fetchAssignments } = useAssignmentsStore();
  const [engineerCapacities, setEngineerCapacities] = useState<Record<string, EngineerCapacity>>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        await Promise.all([
          fetchEngineers(),
          fetchProjects(),
          fetchAssignments()
        ]);
        console.log('Projects data:', projects);
        console.log('Assignments data:', assignments);
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
  const hasError = engineersError || projectsError || assignmentsError;

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="text-center py-8">Loading dashboard data...</div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="p-8">
        <div className="text-center py-8 text-red-600">
          Error loading dashboard data. Please try refreshing the page.
          {engineersError && <p>Engineers: {engineersError}</p>}
          {projectsError && <p>Projects: {projectsError}</p>}
          {assignmentsError && <p>Assignments: {assignmentsError}</p>}
        </div>
      </div>
    );
  }

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
            <CardTitle>Team Utilization(Top 5)</CardTitle>
            <CardDescription>
              Current workload distribution across engineers
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {engineers
              ?.slice(0, 5)
              .sort((a, b) => {
                const capacityA = engineerCapacities[a._id]?.availableCapacity || 100;
                const capacityB = engineerCapacities[b._id]?.availableCapacity || 100;
                return capacityA - capacityB; // Sort by available capacity (ascending)
              })
              .map((engineer) => {
              const capacity = engineerCapacities[engineer._id];
              
              // Calculate the latest end date from all assignments
              const latestEndDate = capacity?.assignments?.reduce((latest, assignment) => {
                const endDate = new Date(assignment.endDate);
                return endDate > latest ? endDate : latest;
              }, new Date(0));

              // Format the date for display
              const formattedEndDate = latestEndDate && latestEndDate > new Date(0)
                ? new Date(latestEndDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })
                : 'Available now';

              // Determine availability status and color
              const availableCapacity = capacity?.availableCapacity || 100;
              const getAvailabilityColor = (capacity: number) => {
                if (capacity >= 80) return 'bg-green-100 text-green-800';
                if (capacity >= 50) return 'bg-yellow-100 text-yellow-800';
                if (capacity >= 20) return 'bg-orange-100 text-orange-800';
                return 'bg-red-100 text-red-800';
              };

              return (
                <div key={engineer._id} className="p-4 bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <span className="text-sm font-semibold text-gray-900">{engineer.name}</span>
                      <div className="text-xs text-gray-500 mt-1">
                        Available from: {formattedEndDate}
                      </div>
                    </div>
                    <div className={`px-2.5 py-1 rounded-full text-xs font-medium ${getAvailabilityColor(availableCapacity)}`}>
                      {availableCapacity}% Available
                    </div>
                  </div>
                  <div className="space-y-2">
                    <CapacityBar 
                      current={capacity?.currentAllocation || 0} 
                      max={capacity?.maxCapacity || 100} 
                    />
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">
                        <span className="font-medium">{capacity?.currentAllocation || 0}%</span> allocated
                      </span>
                      <span className="text-gray-600">
                        <span className="font-medium">{capacity?.availableCapacity || 100}%</span> free
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Projects(Top 5) </CardTitle>
            <CardDescription>
              Latest project status updates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {projects && projects.length > 0 ? (
                projects.slice(0, 5).map((project) => {
                  const projectAssignments = assignments?.filter(
                    assignment => assignment.projectId && assignment.projectId._id === project._id
                  ) || [];
                  console.log(`Project ${project.name} assignments:`, projectAssignments);
                  
                  return (
                    <div key={project._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{project.name}</p>
                        <p className="text-sm text-gray-600">
                          Team: {projectAssignments.length} of {project.teamSize} members
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
                  );
                })
              ) : (
                <div className="text-center text-gray-500 py-4">
                  No projects found
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ManagerDashboard;
