import { useEffect } from 'react';
import { useAssignmentsStore } from '@/store/assignmentsStore';
import { useAuthStore } from '@/store/authStore';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users } from 'lucide-react';

const EngineerAssignments = () => {
  const { assignments, fetchAssignments } = useAssignmentsStore();
  const { user } = useAuthStore();

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  const myAssignments = assignments?.filter(
    assignment => assignment.engineerId?._id === user?._id
  ) || [];

  const columns = [
    {
      accessorKey: 'projectId',
      header: 'Project',
      cell: ({ row }: { row: { original: any } }) => {
        const project = row.original.projectId;
        return (
          <div className="flex items-center gap-2">
            <div className="font-medium">{project?.name || 'N/A'}</div>
            <div className="text-sm text-gray-500">({project?.description || 'No description'})</div>
          </div>
        );
      }
    },
    {
      accessorKey: 'role',
      header: 'Role',
      cell: ({ row }: { row: { original: any } }) => (
        <div className="font-medium">{row.original.role || 'N/A'}</div>
      )
    },
    {
      accessorKey: 'allocationPercentage',
      header: 'Allocation',
      cell: ({ row }: { row: { original: any } }) => (
        <div className="flex items-center gap-2">
          <div className="font-medium">{row.original.allocationPercentage || 0}%</div>
        </div>
      )
    },
    {
      accessorKey: 'startDate',
      header: 'Start Date',
      cell: ({ row }: { row: { original: any } }) => (
        <div>{row.original.startDate ? new Date(row.original.startDate).toLocaleDateString() : 'N/A'}</div>
      )
    },
    {
      accessorKey: 'endDate',
      header: 'End Date',
      cell: ({ row }: { row: { original: any } }) => (
        <div>{row.original.endDate ? new Date(row.original.endDate).toLocaleDateString() : 'N/A'}</div>
      )
    }
  ];

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Assignments</h1>
      </div>

      <div className="bg-white rounded-lg shadow">
        <DataTable
          columns={columns}
          data={myAssignments}
          searchKey="projectId.name"
          searchPlaceholder="Search by project name..."
        />
      </div>
    </div>
  );
};

export default EngineerAssignments;
