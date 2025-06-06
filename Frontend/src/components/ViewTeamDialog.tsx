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
import { useEngineersStore } from '@/store/engineersStore';
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertTriangle } from 'lucide-react';

interface ViewTeamDialogProps {
  project: {
    _id: string;
    name: string;
    teamSize: number;
    requiredSkills: string[];
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ViewTeamDialog = ({ project, open, onOpenChange }: ViewTeamDialogProps) => {
  const { assignments, fetchAssignments } = useAssignmentsStore();
  const { engineers, fetchEngineers } = useEngineersStore();
  const [loading, setLoading] = useState(true);
  const [missingSkills, setMissingSkills] = useState<string[]>([]);

  useEffect(() => {
    if (open) {
      setLoading(true);
      Promise.all([fetchAssignments(), fetchEngineers()]).finally(() => setLoading(false));
    }
  }, [open, fetchAssignments, fetchEngineers]);

  useEffect(() => {
    if (!loading && assignments.length > 0 && engineers.length > 0) {
      // Get all skills from team members
      const teamMemberIds = assignments
        .filter(assignment => assignment.projectId && assignment.projectId._id === project._id)
        .map(assignment => assignment.engineerId && assignment.engineerId._id)
        .filter(Boolean);

      const teamMembers = engineers.filter(engineer => teamMemberIds.includes(engineer._id));
      const teamSkills = new Set(teamMembers.flatMap(engineer => engineer.skills || []));

      // Find missing skills
      const missing = project.requiredSkills.filter(skill => !teamSkills.has(skill));
      setMissingSkills(missing);
    }
  }, [loading, assignments, engineers, project._id, project.requiredSkills]);

  const projectAssignments = assignments.filter(
    assignment => assignment.projectId && assignment.projectId._id === project._id
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

            {/* Missing Skills Section */}
            {missingSkills.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-yellow-800 mb-2">
                  <AlertTriangle className="h-4 w-4" />
                  <h3 className="font-medium">Missing Required Skills</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {missingSkills.map((skill) => (
                    <Badge key={skill} variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {projectAssignments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No team members assigned yet
              </div>
            ) : (
              <div className="space-y-4">
                {projectAssignments.map((assignment) => {
                  if (!assignment.engineerId) return null;
                  return (
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
                        <div className="flex flex-wrap gap-1 mt-1">
                          {assignment.engineerId.skills?.map((skill) => (
                            <Badge 
                              key={skill} 
                              variant="secondary"
                              className={project.requiredSkills.includes(skill) ? 'bg-green-100 text-green-800' : ''}
                            >
                              {skill}
                            </Badge>
                          ))}
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
                  );
                })}
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ViewTeamDialog; 