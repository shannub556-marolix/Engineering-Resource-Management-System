import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/store/authStore';
import { useAssignmentsStore } from '@/store/assignmentsStore';
import { SkillTags } from '@/components/ui/SkillTags';
import { CapacityBar } from '@/components/ui/CapacityBar';
import { Calendar, Clock, User, Award, Edit } from 'lucide-react';
import { format } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import api from '@/api/axios';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AssignmentTimeline from '@/components/AssignmentTimeline';

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

const EditProfileDialog = ({ open, onOpenChange, onSuccess }: { open: boolean; onOpenChange: (open: boolean) => void; onSuccess: () => void }) => {
  const { user, updateProfile } = useAuthStore();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    skills: user?.skills || [],
    seniority: user?.seniority || 'mid',
    maxCapacity: user?.maxCapacity || 100,
    department: user?.department || ''
  });
  const [skillsText, setSkillsText] = useState(user?.skills?.join(', ') || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Convert skills text to array
      const skillsArray = skillsText
        .split(',')
        .map(skill => skill.trim())
        .filter(skill => skill.length > 0);

      await updateProfile({
        ...formData,
        skills: skillsArray
      });

      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully.',
      });

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Update your profile information.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="skills">Skills (comma-separated)</Label>
            <Textarea
              id="skills"
              value={skillsText}
              onChange={(e) => setSkillsText(e.target.value)}
              placeholder="e.g., React, HTML, CSS, JavaScript"
              className="min-h-[80px]"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="seniority">Seniority</Label>
              <Select
                value={formData.seniority}
                onValueChange={(value) => setFormData({ ...formData, seniority: value as 'junior' | 'mid' | 'senior' })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select seniority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="junior">Junior</SelectItem>
                  <SelectItem value="mid">Mid</SelectItem>
                  <SelectItem value="senior">Senior</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="maxCapacity">Max Capacity (%)</Label>
            <Input
              id="maxCapacity"
              type="number"
              min="0"
              max="100"
              value={formData.maxCapacity}
              onChange={(e) => setFormData({ ...formData, maxCapacity: parseInt(e.target.value) })}
              required
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const EngineerDashboard = () => {
  const { user } = useAuthStore();
  const { assignments, loading: assignmentsLoading, fetchAssignments } = useAssignmentsStore();
  const [editProfileOpen, setEditProfileOpen] = useState(false);

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

  // Get all assignments from capacity data
  const allAssignments = capacityData?.engineer?.assignments || [];
  // Filter active assignments for the active assignments section
  const activeAssignments = allAssignments.filter(
    assignment => assignment.status === 'active'
  );
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
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Profile</span>
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setEditProfileOpen(true)}
            >
              <Edit className="h-4 w-4" />
            </Button>
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

      {/* Assignment Timeline */}
      <div className="mt-8">
        <AssignmentTimeline assignments={allAssignments} />
      </div>

      <EditProfileDialog
        open={editProfileOpen}
        onOpenChange={setEditProfileOpen}
        onSuccess={() => {
          // Refresh the page data
          fetchAssignments();
        }}
      />
    </div>
  );
};

export default EngineerDashboard;
