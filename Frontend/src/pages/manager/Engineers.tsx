import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useEngineersStore } from '@/store/engineersStore';
import { SkillTags } from '@/components/ui/SkillTags';
import { CapacityBar } from '@/components/ui/CapacityBar';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ViewEngineerCapacityDialog from '@/components/ViewEngineerCapacityDialog';

const CreateEngineerDialog = ({ onSuccess }: { onSuccess: () => void }) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    skills: [] as string[],
    seniority: 'junior',
    maxCapacity: 100,
    department: '',
  });
  const { createEngineer } = useEngineersStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createEngineer(formData);
      toast({
        title: 'Engineer added',
        description: 'The engineer has been added successfully.',
      });
      setOpen(false);
      onSuccess();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add engineer. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Engineer
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Engineer</DialogTitle>
          <DialogDescription>
            Fill in the details to add a new engineer to your team.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="skills">Skills (hyphen-separated)</Label>
            <Input
              id="skills"
              value={formData.skills.join('-')}
              onChange={(e) => setFormData({
                ...formData,
                skills: e.target.value.split('-').map(skill => skill.trim()).filter(Boolean)
              })}
              placeholder="e.g., React-Html-CSS-Javascript"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="seniority">Seniority</Label>
              <Select
                value={formData.seniority}
                onValueChange={(value) => setFormData({ ...formData, seniority: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select seniority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="junior">Junior</SelectItem>
                  <SelectItem value="mid">Mid</SelectItem>
                  <SelectItem value="senior">Senior</SelectItem>
                  <SelectItem value="lead">Lead</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="maxCapacity">Max Capacity (%)</Label>
            <Input
              id="maxCapacity"
              type="number"
              min="0"
              max="100"
              value={formData.maxCapacity}
              onChange={(e) => setFormData({ ...formData, maxCapacity: parseInt(e.target.value) })}
              required
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Engineer</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const EngineersPage = () => {
  const { engineers, loading, fetchEngineers, deleteEngineer } = useEngineersStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEngineer, setSelectedEngineer] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    fetchEngineers();
  }, [fetchEngineers]);

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center py-8">Loading engineers...</div>
      </div>
    );
  }

  const filteredEngineers = engineers ? engineers.filter(engineer => {
    if (!engineer) return false;
    return (
      engineer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      engineer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      engineer.skills?.some(skill => skill?.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }) : [];

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      try {
        await deleteEngineer(id);
        toast({
          title: 'Engineer deleted',
          description: `${name} has been removed from the system.`,
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to delete engineer. Please try again.',
          variant: 'destructive',
        });
      }
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Engineers</h1>
          <p className="text-gray-600 mt-2">Manage your engineering team</p>
        </div>
        <CreateEngineerDialog onSuccess={fetchEngineers} />
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
              <Input
                placeholder="Search engineers by name, email, or skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Skills</TableHead>
                <TableHead>Seniority</TableHead>
                <TableHead>Department</TableHead>
                {/* <TableHead>Capacity</TableHead> */}
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEngineers.map((engineer) => (
                <TableRow key={engineer._id}>
                  <TableCell className="font-medium">{engineer.name}</TableCell>
                  <TableCell>{engineer.email}</TableCell>
                  <TableCell>
                    <SkillTags skills={engineer.skills} />
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="capitalize">
                      {engineer.seniority}
                    </Badge>
                  </TableCell>
                  <TableCell>{engineer.department}</TableCell>
                  {/* <TableCell>
                    <div className="w-32">
                      <CapacityBar
                        current={engineer.currentAllocation || 0}
                        max={engineer.maxCapacity}
                      />
                    </div>
                  </TableCell> */}
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedEngineer({ id: engineer._id, name: engineer.name })}
                      >
                        View Assignments
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDelete(engineer._id, engineer.name)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredEngineers.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? 'No engineers found matching your search.' : 'No engineers added yet.'}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedEngineer && (
        <ViewEngineerCapacityDialog
          engineerId={selectedEngineer.id}
          engineerName={selectedEngineer.name}
          open={!!selectedEngineer}
          onOpenChange={(open) => !open && setSelectedEngineer(null)}
        />
      )}
    </div>
  );
};

export default EngineersPage;
