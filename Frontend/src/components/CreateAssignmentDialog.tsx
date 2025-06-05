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

interface CreateAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (e: React.FormEvent) => void;
  initialData: any;
}

const CreateAssignmentDialog = ({
  open,
  onOpenChange,
  onSuccess,
  initialData,
}: CreateAssignmentDialogProps) => {
  const { engineers, fetchEngineers } = useEngineersStore();
  const { projects, fetchProjects } = useProjectsStore();
  const { createAssignment, fetchAssignments } = useAssignmentsStore();
  const [loading, setLoading] = useState(false);
  const [selectedEngineer, setSelectedEngineer] = useState<Engineer | null>(null);
  const [formData, setFormData] = useState({
    projectId: '',
    engineerId: '',
    allocationPercentage: 0,
    role: '',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    fetchEngineers();
    fetchProjects();
  }, [fetchEngineers, fetchProjects]);

  const selectedProject = projects?.find(p => p._id === formData.projectId);

  // Fetch engineer capacity when an engineer is selected
  useEffect(() => {
    const fetchEngineerCapacity = async () => {
      if (formData.engineerId) {
        try {
          const response = await api.get(`/api/engineers/${formData.engineerId}/capacity`);
          if (response.data.success) {
            setSelectedEngineer(response.data.data.engineer);
          }
        } catch (error) {
          console.error('Error fetching engineer capacity:', error);
        }
      } else {
        setSelectedEngineer(null);
      }
    };

    fetchEngineerCapacity();
  }, [formData.engineerId]);

  const currentAllocation = selectedEngineer?.currentAllocation || 0;
  const maxCapacity = selectedEngineer?.maxCapacity || 0;
  const remainingCapacity = selectedEngineer?.availableCapacity || 0;

  const handleEngineerChange = (engineerId: string) => {
    const engineer = engineers?.find(e => e._id === engineerId);
    if (engineer) {
      setFormData(prev => ({
        ...prev,
        engineerId,
        allocationPercentage: Math.min(remainingCapacity, 100) // Ensure we don't exceed remaining capacity
      }));
    }
  };

  const handleProjectChange = (projectId: string) => {
    setFormData(prev => ({
      ...prev,
      projectId,
      startDate: '', // Reset dates when project changes
      endDate: ''
    }));
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

    // Fetch latest assignments before validation
    await fetchAssignments();

    // Validate engineer capacity
    if (selectedEngineer && formData.allocationPercentage > remainingCapacity) {
      toast({
        title: 'Error',
        description: `Engineer only has ${remainingCapacity}% capacity remaining. Current allocation: ${currentAllocation}%, Max capacity: ${maxCapacity}%`,
        variant: 'destructive',
      });
      return;
    }

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
      await createAssignment(assignmentData);
      await fetchAssignments();
      toast({
        title: 'Assignment created',
        description: 'The engineer has been assigned to the project successfully.',
      });
      onOpenChange(false);
      onSuccess(e);
    } catch (error: any) {
      console.error('Form submission error:', error.response?.data || error);
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to create assignment. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Assignment' : 'Create Assignment'}</DialogTitle>
          <DialogDescription>
            {initialData ? 'Update the assignment details' : 'Assign an engineer to a project'}
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Project Selection */}
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
            </div>

            {/* Engineer Selection */}
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

            {/* Capacity Information */}
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

            {/* Allocation Percentage */}
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

            {/* Role */}
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

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({
                    ...formData,
                    startDate: e.target.value
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({
                    ...formData,
                    endDate: e.target.value
                  })}
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Saving...' : initialData ? 'Update Assignment' : 'Create Assignment'}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateAssignmentDialog; 