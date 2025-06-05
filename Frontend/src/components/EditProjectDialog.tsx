import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useProjectsStore } from '@/store/projectsStore';
import { toast } from '@/hooks/use-toast';

interface EditProjectDialogProps {
  project: {
    _id: string;
    name: string;
    description: string;
    status: string;
    teamSize: number;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const EditProjectDialog = ({ project, open, onOpenChange, onSuccess }: EditProjectDialogProps) => {
  const { updateProject } = useProjectsStore();
  const [formData, setFormData] = useState({
    status: project.status,
    teamSize: project.teamSize,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await updateProject(project._id, {
        status: formData.status,
        teamSize: Number(formData.teamSize)
      });
      toast({
        title: 'Project updated',
        description: 'The project has been updated successfully.',
      });
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      console.error('Form submission error:', error.response?.data || error);
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to update project. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Project</DialogTitle>
          <DialogDescription>
            Update the project details for {project.name}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData({ ...formData, status: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="planning">Planning</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="teamSize">Team Size</Label>
            <Input
              id="teamSize"
              type="number"
              min="1"
              value={formData.teamSize}
              onChange={(e) => setFormData({ ...formData, teamSize: Number(e.target.value) })}
              required
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Update Project</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditProjectDialog; 