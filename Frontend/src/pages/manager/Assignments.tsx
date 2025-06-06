import { useEffect, useState } from 'react';
import { useAssignmentsStore } from '@/store/assignmentsStore';
import { useEngineersStore } from '@/store/engineersStore';
import { useProjectsStore } from '@/store/projectsStore';
import { Search, Plus, MoreHorizontal } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTable } from "@/components/ui/data-table";
import CreateAssignmentDialog from '@/components/CreateAssignmentDialog';
import EditAssignmentDialog from '@/components/EditAssignmentDialog';

interface Assignment {
  _id: string;
  engineerId: {
    _id: string;
    name: string;
    email: string;
    maxCapacity: number;
  };
  projectId: {
    _id: string;
    name: string;
    client: string;
  };
  role: string;
  allocationPercentage: number;
  startDate: string;
  endDate: string;
}

const AssignmentsPage = () => {
  const { assignments, fetchAssignments } = useAssignmentsStore();
  const { engineers, fetchEngineers } = useEngineersStore();
  const { projects, fetchProjects } = useProjectsStore();
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);

  useEffect(() => {
    fetchAssignments();
    fetchEngineers();
    fetchProjects();
  }, [fetchAssignments, fetchEngineers, fetchProjects]);

  const handleAssignmentCreated = () => {
    fetchAssignments();
  };

  const handleEditAssignment = (assignment: Assignment) => {
    setEditingAssignment(assignment);
  };

  const handleDeleteAssignment = async (assignmentId: string) => {
    if (window.confirm('Are you sure you want to delete this assignment?')) {
      try {
        await useAssignmentsStore.getState().deleteAssignment(assignmentId);
        await fetchAssignments();
        toast({
          title: 'Assignment deleted',
          description: 'The assignment has been removed successfully.',
        });
      } catch (error) {
        console.error('Error deleting assignment:', error);
        toast({
          title: 'Error',
          description: 'Failed to delete assignment. Please try again.',
          variant: 'destructive',
        });
      }
    }
  };

  const columns = [
    {
      accessorKey: 'engineerId',
      header: 'Engineer',
      cell: ({ row }: { row: { original: Assignment } }) => {
        const engineer = row.original.engineerId;
        if (!engineer) return <div className="text-gray-500">Deleted Engineer</div>;
        return (
          <div className="flex items-center gap-2">
            <div className="font-medium">{engineer.name}</div>
            <div className="text-sm text-gray-500">({engineer.email})</div>
          </div>
        );
      }
    },
    {
      accessorKey: 'projectId',
      header: 'Project',
      cell: ({ row }: { row: { original: Assignment } }) => {
        const project = row.original.projectId;
        if (!project) return <div className="text-gray-500">Deleted Project</div>;
        return (
          <div className="flex items-center gap-2">
            <div className="font-medium">{project.name}</div>
          </div>
        );
      }
    },
    {
      accessorKey: 'role',
      header: 'Role',
      cell: ({ row }: { row: { original: Assignment } }) => (
        <div className="font-medium">{row.original.role}</div>
      )
    },
    {
      accessorKey: 'allocationPercentage',
      header: 'Allocation',
      cell: ({ row }: { row: { original: Assignment } }) => (
        <div className="flex items-center gap-2">
          <div className="font-medium">{row.original.allocationPercentage}%</div>
        </div>
      )
    },
    {
      accessorKey: 'startDate',
      header: 'Start Date',
      cell: ({ row }: { row: { original: Assignment } }) => (
        <div>{new Date(row.original.startDate).toLocaleDateString()}</div>
      )
    },
    {
      accessorKey: 'endDate',
      header: 'End Date',
      cell: ({ row }: { row: { original: Assignment } }) => (
        <div>{new Date(row.original.endDate).toLocaleDateString()}</div>
      )
    },
    {
      id: 'actions',
      cell: ({ row }: { row: { original: Assignment } }) => {
        const assignment = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => handleEditAssignment(assignment)}
              >
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleDeleteAssignment(assignment._id)}
                className="text-red-600"
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      }
    }
  ];

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Assignments</h1>
        <CreateAssignmentDialog onSuccess={handleAssignmentCreated} />
      </div>

      <div className="bg-white rounded-lg shadow">
        <DataTable
          columns={columns}
          data={assignments || []}
          searchKey="engineerId.name"
          searchPlaceholder="Search by engineer name..."
        />
      </div>

      {editingAssignment && (
        <EditAssignmentDialog
          assignment={editingAssignment}
          open={!!editingAssignment}
          onOpenChange={(open) => !open && setEditingAssignment(null)}
          onSuccess={handleAssignmentCreated}
        />
      )}
    </div>
  );
};

export default AssignmentsPage;
