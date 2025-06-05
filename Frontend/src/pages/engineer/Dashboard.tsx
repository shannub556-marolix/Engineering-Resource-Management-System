import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/store/authStore';
import { useAssignmentsStore } from '@/store/assignmentsStore';
import { SkillTags } from '@/components/ui/SkillTags';
import { CapacityBar } from '@/components/ui/CapacityBar';
import { Calendar, Clock, User, Award } from 'lucide-react';
import { format } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import api from '@/api/axios';
import axios from 'axios';

interface CapacityData {
  engineer: {
    _id: string;
    name: string;
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
}

interface ApiResponse {
  success: boolean;
  data: CapacityData;
}

const EngineerDashboard = () => {
  const { user } = useAuthStore();
  const { assignments, loading: assignmentsLoading, fetchAssignments } = useAssignmentsStore();

  const { data: capacityData, isLoading: capacityLoading, error: capacityError } = useQuery<CapacityData>({
    queryKey: ['engineerCapacity', user?._id],
    queryFn: async () => {
      if (!user?._id) {
        throw new Error('User ID is required');
      }
      
      const response = await api.get<ApiResponse>(`/api/engineers/${user._id}/capacity`);
      return response.data.data;
    },
    enabled: !!user?._id
  });

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  // Just use the assignments as they come from the API
  const activeAssignments = capacityData?.engineer?.assignments?.filter(
    assignment => assignment.status === 'active'
  ) || [];
  console.log('Active Assignments:', activeAssignments);
  const activeProjectCount = activeAssignments.length;

  if (capacityLoading) {
    return <div>Loading...</div>;
  }

  if (capacityError) {
    return (
      <div className="p-8">
        <div className="text-center py-8 text-red-600">
          <p className="font-semibold mb-2">Error loading capacity data</p>
          <p className="text-sm text-gray-600">
            {capacityError instanceof Error ? capacityError.message : 'Please try again later'}
          </p>
        </div>
      </div>
    );
  }

  // Default values if capacity data is not available
  const currentAllocation = capacityData?.engineer?.currentAllocation ?? 0;
  const maxCapacity = capacityData?.engineer?.maxCapacity ?? 100;
  const availableCapacity = capacityData?.engineer?.availableCapacity ?? 0;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name}!</h1>
        <p className="text-gray-600 mt-2">Here's an overview of your current assignments and workload</p>
      </div>

      {/* Profile Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Profile</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-medium">{user?.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Seniority</p>
              <Badge variant="outline">{user?.seniority}</Badge>
            </div>
            {user?.skills && user.skills.length > 0 && (
              <div>
                <p className="text-sm text-gray-600 mb-2">Skills</p>
                <SkillTags skills={user.skills} />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Current Workload</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold">{currentAllocation}%</div>
                <p className="text-sm text-gray-600">Total Allocation</p>
              </div>
              <CapacityBar current={currentAllocation} max={maxCapacity} />
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="text-center">
                  <div className="text-xl font-bold">{availableCapacity}%</div>
                  <p className="text-sm text-gray-600">Available</p>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold">{activeProjectCount}</div>
                  <p className="text-sm text-gray-600">Active Projects</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Award className="h-5 w-5" />
              <span>Activity</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Active Projects</span>
              <span className="font-medium">{activeProjectCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Available Capacity</span>
              <span className="font-medium">{availableCapacity}%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current Assignments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Active Assignments</span>
          </CardTitle>
          <CardDescription>
            Your current active project assignments and responsibilities
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activeAssignments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              You don't have any active assignments at the moment.
            </div>
          ) : (
            <div className="space-y-4">
              {activeAssignments.map((assignment, index) => (
                <div key={index} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-lg">
                        {assignment.projectName}
                      </h3>
                      <Badge variant="outline" className="mt-1">
                        {assignment.role}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <Badge className={`${
                        assignment.allocationPercentage >= 80 ? 'bg-red-100 text-red-800' :
                        assignment.allocationPercentage >= 60 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {assignment.allocationPercentage}% allocated
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {format(new Date(assignment.startDate), 'MMM d, yyyy')} - {format(new Date(assignment.endDate), 'MMM d, yyyy')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EngineerDashboard;
