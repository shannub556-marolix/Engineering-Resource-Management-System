import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useEngineersStore } from '@/store/engineersStore';
import { useProjectsStore } from '@/store/projectsStore';
import { useAssignmentsStore } from '@/store/assignmentsStore';
import { toast } from '@/hooks/use-toast';
import { Plus } from 'lucide-react';
import api from '@/api/axios';
import { Progress } from '@/components/ui/progress';

interface Engineer {
  _id: string;
  name: string;
  maxCapacity: number;
  currentAllocation: number;
  availableCapacity: number;
}

interface Project {
  _id: string;
  name: string;
  startDate: string;
  endDate: string;
}

interface CreateAssignmentDialogProps {
  onSuccess: () => void;
  initialData?: any;
}

const CreateAssignmentDialog = ({
  onSuccess,
  initialData,
}: CreateAssignmentDialogProps) => {
  const { engineers, fetchEngineers } = useEngineersStore();
  const { projects, fetchProjects } = useProjectsStore();
  const { createAssignment, fetchAssignments } = useAssignmentsStore();
  const [loading, setLoading] = useState(false);
  const [selectedEngineer, setSelectedEngineer] = useState<Engineer | null>(null);
  const [formData, setFormData] = useState({
    projectId: initialData?.projectId || '',
    engineerId: initialData?.engineerId || '',
    allocationPercentage: initialData?.allocationPercentage || 0,
    role: initialData?.role || '',
    startDate: initialData?.startDate?.split('T')[0] || '',
    endDate: initialData?.endDate?.split('T')[0] || '',
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dateError, setDateError] = useState<string | null>(null);

  useEffect(() => {
    fetchEngineers();
    fetchProjects();
  }, [fetchEngineers, fetchProjects]);

  useEffect(() => {
    if (initialData) {
      setIsDialogOpen(true);
      if (initialData.engineerId) {
        const fetchEngineerCapacity = async () => {
          try {
            const response = await api.get(`/api/engineers/${initialData.engineerId}/capacity`);
            if (response.data.success) {
              setSelectedEngineer(response.data.data.engineer);
            }
          } catch (error) {
            console.error('Error fetching engineer capacity for initial data:', error);
          }
        };
        fetchEngineerCapacity();
      }
    } else {
      setFormData({
        projectId: '',
        engineerId: '',
        allocationPercentage: 0,
        role: '',
        startDate: '',
        endDate: ''
      });
      setSelectedEngineer(null);
    }
  }, [initialData]);

  useEffect(() => {
    const fetchEngineerCapacity = async () => {
      if (!initialData && formData.engineerId) {
        try {
          const response = await api.get(`/api/engineers/${formData.engineerId}/capacity`);
          if (response.data.success) {
            setSelectedEngineer(response.data.data.engineer);
          }
        } catch (error) {
          console.error('Error fetching engineer capacity:', error);
        }
      } else if (!initialData && !formData.engineerId) {
        setSelectedEngineer(null);
      }
    };

    fetchEngineerCapacity();
  }, [formData.engineerId, initialData]);

  const selectedProject = projects?.find(p => p._id === formData.projectId);

  const currentAllocation = selectedEngineer?.currentAllocation || 0;
  const maxCapacity = selectedEngineer?.maxCapacity || 0;
  const remainingCapacity = selectedEngineer?.availableCapacity || 0;

  const validateDates = (startDate: string, endDate: string, project: Project | undefined) => {
    if (!project) return null;
    
    const projectStart = new Date(project.startDate);
    const projectEnd = new Date(project.endDate);
    const assignmentStart = new Date(startDate);
    const assignmentEnd = new Date(endDate);

    if (assignmentStart < projectStart) {
      return `Start date cannot be before project start date (${project.startDate})`;
    }
    if (assignmentEnd > projectEnd) {
      return `End date cannot be after project end date (${project.endDate})`;
    }
    if (assignmentStart > assignmentEnd) {
      return 'Start date cannot be after end date';
    }
    return null;
  };

  const handleEngineerChange = (engineerId: string) => {
    const engineer = engineers?.find(e => e._id === engineerId);
    if (engineer) {
      setFormData(prev => ({
        ...prev,
        engineerId,
        allocationPercentage: 0
      }));
    }
  };

  const handleProjectChange = (projectId: string) => {
    const project = projects?.find(p => p._id === projectId);
    setFormData(prev => ({
      ...prev,
      projectId,
      startDate: '', // Reset dates when project changes
      endDate: ''
    }));
    setDateError(null); // Reset date error when project changes
  };

  const handleDateChange = (field: 'startDate' | 'endDate', value: string) => {
    const newFormData = {
      ...formData,
      [field]: value
    };
    setFormData(newFormData);
    
    // Only validate if both dates are set
    if (newFormData.startDate && newFormData.endDate) {
      const error = validateDates(newFormData.startDate, newFormData.endDate, selectedProject);
      setDateError(error);
    } else {
      setDateError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.engineerId || !formData.projectId || !formData.role || !formData.startDate || !formData.endDate) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    // Validate dates before submission
    const dateValidationError = validateDates(formData.startDate, formData.endDate, selectedProject);
    if (dateValidationError) {
      toast({
        title: 'Error',
        description: dateValidationError,
        variant: 'destructive',
      });
      return;
    }

    // Fetch latest assignments before validation
    await fetchAssignments();

    if (!initialData || (initialData && formData.engineerId !== initialData.engineerId)) {
      if (selectedEngineer && formData.allocationPercentage > remainingCapacity) {
        toast({
          title: 'Error',
          description: `Engineer only has ${remainingCapacity}% capacity remaining. Current allocation: ${currentAllocation}%, Max capacity: ${maxCapacity}%`,
          variant: 'destructive',
        });
        return;
      }
    }

    setLoading(true);
    try {
      const assignmentData = {
        engineerId: formData.engineerId,
        projectId: formData.projectId,
        allocationPercentage: Number(formData.allocationPercentage),
        startDate: new Date(formData.startDate).toISOString().split('T')[0],
        endDate: new Date(formData.endDate).toISOString().split('T')[0],
        role: formData.role.trim()
      };

      console.log('Submitting assignment data:', assignmentData);

      if (initialData) {
        console.log('Update logic not yet implemented');
      } else {
        await createAssignment(assignmentData);
      }

      await fetchAssignments();
      toast({
        title: initialData ? 'Assignment updated' : 'Assignment created',
        description: initialData ? 'The assignment has been updated successfully.' : 'The engineer has been assigned to the project successfully.',
      });
      setIsDialogOpen(false);
      onSuccess();
    } catch (error: any) {
      console.error('Form submission error:', error.response?.data || error);
      toast({
        title: 'Error',
        description: error.response?.data?.error || (initialData ? 'Failed to update assignment. Please try again.' : 'Failed to create assignment. Please try again.'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        {!initialData && (
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Create Assignment
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Assignment' : 'Create Assignment'}</DialogTitle>
          <DialogDescription>
            {initialData ? 'Update the assignment details' : 'Assign an engineer to a project'}
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="project">Project</Label>
              <Select
                value={formData.projectId}
                onValueChange={(value) => handleProjectChange(value)}
                disabled={!!initialData}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project._id} value={project._id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedProject && (
                <p className="text-sm text-gray-500">
                  Project dates: {selectedProject.startDate.split('T')[0]} to {selectedProject.endDate.split('T')[0]}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="engineer">Engineer</Label>
              <Select
                value={formData.engineerId}
                onValueChange={(value) => handleEngineerChange(value)}
                disabled={!!initialData}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an engineer" />
                </SelectTrigger>
                <SelectContent>
                  {engineers.map((engineer) => (
                    <SelectItem key={engineer._id} value={engineer._id}>
                      {engineer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedEngineer && (
              <div className="space-y-2">
                <Label>Capacity Information</Label>
                <div className="text-sm text-gray-500">
                  <p>Current Allocation: {selectedEngineer.currentAllocation}%</p>
                  <p>Available Capacity: {selectedEngineer.availableCapacity}%</p>
                  <p>Max Capacity: {selectedEngineer.maxCapacity}%</p>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="allocation">Allocation Percentage</Label>
              <Input
                id="allocation"
                type="number"
                min="0"
                max="100"
                value={formData.allocationPercentage}
                onChange={(e) => setFormData({
                  ...formData,
                  allocationPercentage: parseInt(e.target.value)
                })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Input
                id="role"
                value={formData.role}
                onChange={(e) => setFormData({
                  ...formData,
                  role: e.target.value
                })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleDateChange('startDate', e.target.value)}
                  style={{justifyContent: "space-around"}}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleDateChange('endDate', e.target.value)}
                  style={{justifyContent: "space-around"}}
                />
              </div>
            </div>
            {dateError && (
              <p className="text-sm text-red-500">{dateError}</p>
            )}

            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading || !!dateError}
            >
              {loading ? 'Saving...' : initialData ? 'Update Assignment' : 'Create Assignment'}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateAssignmentDialog; 