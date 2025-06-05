import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ViewEngineerCapacityDialog from './ViewEngineerCapacityDialog';
import { useEngineersStore } from '@/store/engineersStore';
import { useAssignmentsStore } from '@/store/assignmentsStore';

interface Engineer {
  _id: string;
  name: string;
  email: string;
  skills: string[];
  seniority: string;
  department: string;
  maxCapacity: number;
}

const EngineersTable = () => {
  const { engineers, loading, error, fetchEngineers } = useEngineersStore();
  const { fetchAssignments } = useAssignmentsStore();
  const [selectedEngineer, setSelectedEngineer] = useState<Engineer | null>(null);
  const [isCapacityDialogOpen, setIsCapacityDialogOpen] = useState(false);

  useEffect(() => {
    fetchEngineers();
    fetchAssignments();
  }, [fetchEngineers, fetchAssignments]);

  const handleViewCapacity = (engineer: Engineer) => {
    setSelectedEngineer(engineer);
    setIsCapacityDialogOpen(true);
  };

  // Function to process skills
  const processSkills = (skills: string[] | string) => {
    if (Array.isArray(skills)) {
      return skills;
    }
    // If skills is a string, split by hyphen and trim each skill
    return skills.split('-').map(skill => skill.trim());
  };

  if (loading) {
    return <div>Loading engineers...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Seniority</TableHead>
            <TableHead>Skills</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {engineers.map((engineer) => (
            <TableRow key={engineer._id}>
              <TableCell className="font-medium">{engineer.name}</TableCell>
              <TableCell>{engineer.email}</TableCell>
              <TableCell>{engineer.department}</TableCell>
              <TableCell>
                <Badge variant="outline" className="capitalize">
                  {engineer.seniority}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {processSkills(engineer.skills).map((skill, index) => (
                    <Badge key={index} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </TableCell>
              <TableCell>
                <Button
                  variant="outline"
                  onClick={() => handleViewCapacity(engineer)}
                >
                  View Assignments
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {selectedEngineer && (
        <ViewEngineerCapacityDialog
          engineerId={selectedEngineer._id}
          engineerName={selectedEngineer.name}
          open={isCapacityDialogOpen}
          onOpenChange={setIsCapacityDialogOpen}
        />
      )}
    </div>
  );
};

export default EngineersTable; 