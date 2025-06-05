import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import api from '@/api/axios';

interface Assignment {
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
}

interface EngineerCapacity {
  _id: string;
  name: string;
  maxCapacity: number;
  currentAllocation: number;
  availableCapacity: number;
  assignments: Assignment[];
}

interface ViewEngineerCapacityDialogProps {
  engineerId: string;
  engineerName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ViewEngineerCapacityDialog = ({
  engineerId,
  engineerName,
  open,
  onOpenChange,
}: ViewEngineerCapacityDialogProps) => {
  const [loading, setLoading] = useState(true);
  const [capacity, setCapacity] = useState<EngineerCapacity | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCapacity = async () => {
      if (open && engineerId) {
        setLoading(true);
        setError(null);
        try {
          console.log('Fetching capacity for engineer:', engineerId);
          const response = await api.get(`/api/engineers/${engineerId}/capacity`);
          console.log('Raw API response:', response);
          console.log('Response data:', response.data);
          
          if (response.data.success) {
            console.log('Setting capacity data:', response.data.data.engineer);
            setCapacity(response.data.data.engineer);
          } else {
            console.error('API returned error:', response.data.error);
            setError('Failed to load capacity data');
          }
        } catch (error) {
          console.error('Error fetching engineer capacity:', error);
          setError('Failed to load capacity data');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchCapacity();
  }, [open, engineerId]);

  // Calculate active assignments and their total allocation
  const activeAssignments = capacity?.assignments.filter(
    assignment => assignment.projectId.status === 'active'
  ) || [];
  
  const totalActiveAllocation = activeAssignments.reduce(
    (sum, assignment) => sum + assignment.allocationPercentage,
    0
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Engineer Capacity</DialogTitle>
          <DialogDescription>
            View capacity and assignments for {engineerName}
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto">
          {loading ? (
            <div className="text-center py-8">Loading capacity data...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">{error}</div>
          ) : capacity ? (
            <div className="space-y-6">
              {/* Capacity Overview */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Capacity Overview</h3>
                  <Badge variant="outline">
                    {capacity.availableCapacity}% Available
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Current Allocation: {capacity.currentAllocation}%</span>
                    <span>Max Capacity: {capacity.maxCapacity}%</span>
                  </div>
                  <Progress value={capacity.currentAllocation} max={capacity.maxCapacity} />
                </div>
              </div>

              {/* Assignments Table */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Current Assignments</h3>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Project</TableHead>
                        <TableHead>Allocation</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Duration</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {capacity.assignments && capacity.assignments.length > 0 ? (
                        capacity.assignments.map((assignment, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{assignment.projectName}</TableCell>
                            <TableCell>{assignment.allocationPercentage}%</TableCell>
                            <TableCell>{assignment.role}</TableCell>
                            <TableCell>
                              <Badge variant={assignment.projectId.status === 'active' ? 'default' : 'secondary'}>
                                {assignment.projectId.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {new Date(assignment.startDate).toLocaleDateString()} - {new Date(assignment.endDate).toLocaleDateString()}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-gray-500">
                            No assignments
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">No capacity data available</div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewEngineerCapacityDialog; 