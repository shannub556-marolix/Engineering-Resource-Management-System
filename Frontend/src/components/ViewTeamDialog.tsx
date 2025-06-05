import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAssignmentsStore } from '@/store/assignmentsStore';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';

interface ViewTeamDialogProps {
  project: {
    _id: string;
    name: string;
    teamSize: number;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ViewTeamDialog = ({ project, open, onOpenChange }: ViewTeamDialogProps) => {
  const { assignments, fetchAssignments } = useAssignmentsStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open) {
      setLoading(true);
      fetchAssignments().finally(() => setLoading(false));
    }
  }, [open, fetchAssignments]);

  const projectAssignments = assignments.filter(
    assignment => assignment.projectId._id === project._id
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Team Members - {project.name}</DialogTitle>
          <DialogDescription>
            View all team members assigned to this project
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center text-sm text-gray-500">
              <span>Total Team Size: {project.teamSize}</span>
              <span>Current Members: {projectAssignments.length}</span>
            </div>

            {projectAssignments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No team members assigned yet
              </div>
            ) : (
              <div className="space-y-4">
                {projectAssignments.map((assignment) => (
                  <div
                    key={assignment._id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="space-y-1">
                      <div className="font-medium">
                        {assignment.engineerId.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {assignment.role}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        {assignment.allocationPercentage}% Allocation
                      </Badge>
                      <Badge variant="outline">
                        {new Date(assignment.startDate).toLocaleDateString()} - {new Date(assignment.endDate).toLocaleDateString()}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ViewTeamDialog; 