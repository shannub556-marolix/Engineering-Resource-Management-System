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
} from '@/components/ui/dialog';
import { useAssignmentsStore } from '@/store/assignmentsStore';
import { toast } from '@/hooks/use-toast';

interface EditAssignmentDialogProps {
  assignment: {
    _id: string;
    engineerId: {
      _id: string;
      name: string;
      maxCapacity: number;
    };
    allocationPercentage: number;
    role: string;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const EditAssignmentDialog = ({ assignment, open, onOpenChange, onSuccess }: EditAssignmentDialogProps) => {
  const { updateAssignment, fetchAssignments } = useAssignmentsStore();
  const [formData, setFormData] = useState({
    allocationPercentage: assignment.allocationPercentage,
    role: assignment.role,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await updateAssignment(assignment._id, {
        allocationPercentage: Number(formData.allocationPercentage),
        role: formData.role.trim()
      });
      await fetchAssignments();
      toast({
        title: 'Assignment updated',
        description: 'The assignment has been updated successfully.',
      });
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      console.error('Form submission error:', error.response?.data || error);
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to update assignment. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Assignment</DialogTitle>
          <DialogDescription>
            Update the assignment details for {assignment.engineerId.name}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Input
              id="role"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              placeholder="e.g., Lead Developer, Frontend Developer"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="allocationPercentage">Allocation (%)</Label>
            <Input
              id="allocationPercentage"
              type="number"
              min="1"
              max={100}
              value={formData.allocationPercentage}
              onChange={(e) => setFormData({ ...formData, allocationPercentage: parseInt(e.target.value) })}
              required
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Update Assignment</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditAssignmentDialog; 