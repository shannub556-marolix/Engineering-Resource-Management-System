import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useProjectsStore, Project } from '@/store/projectsStore';
import { SkillTags } from '@/components/ui/SkillTags';
import { Search, Plus, Edit, Trash2, Users, Calendar, AlertTriangle } from 'lucide-react';
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ViewTeamDialog from '@/components/ViewTeamDialog';
import EditProjectDialog from '@/components/EditProjectDialog';
import { useAssignmentsStore } from '@/store/assignmentsStore';
import { useEngineersStore } from '@/store/engineersStore';

const CreateProjectDialog = ({ onSuccess }: { onSuccess: () => void }) => {
  const [open, setOpen] = useState(false);
  const [skillsText, setSkillsText] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    status: 'planning' as 'planning' | 'active' | 'completed',
    teamSize: 1,
    requiredSkills: [] as string[],
    currentTeamSize: 0
  });
  const { createProject } = useProjectsStore();

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      requiredSkills: skillsText.split(',').map(skill => skill.trim()).filter(Boolean)
    }));
  }, [skillsText]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createProject(formData);
      toast({
        title: 'Project created',
        description: 'The project has been created successfully.',
      });
      setOpen(false);
      onSuccess();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create project. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Project
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            Fill in the details to create a new project.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Project Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value as 'planning' | 'active' | 'completed' })}
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
                value={formData.teamSize}
                onChange={(e) => setFormData({ ...formData, teamSize: Number(e.target.value) })}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="requiredSkills">Required Skills (comma-separated)</Label>
            <Textarea
              id="requiredSkills"
              value={skillsText}
              onChange={(e) => setSkillsText(e.target.value)}
              placeholder="e.g., React, Node.js, TypeScript, Python"
              className="min-h-[80px]"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Project</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const ProjectsPage = () => {
  const { projects, loading, fetchProjects, deleteProject } = useProjectsStore();
  const { assignments, fetchAssignments } = useAssignmentsStore();
  const { engineers, fetchEngineers } = useEngineersStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [missingSkillsMap, setMissingSkillsMap] = useState<Record<string, string[]>>({});

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([
        fetchProjects(),
        fetchAssignments(),
        fetchEngineers()
      ]);
    };
    fetchData();
  }, [fetchProjects, fetchAssignments, fetchEngineers]);

  useEffect(() => {
    if (projects && assignments && engineers) {
      const missingSkills: Record<string, string[]> = {};
      
      projects.forEach(project => {
        const projectAssignments = assignments.filter(
          assignment => assignment.projectId && assignment.projectId._id === project._id
        );
        
        const teamMemberIds = projectAssignments
          .filter(assignment => assignment.engineerId)
          .map(assignment => assignment.engineerId._id);
        
        const teamMembers = engineers.filter(
          engineer => teamMemberIds.includes(engineer._id)
        );
        
        const teamSkills = new Set(
          teamMembers.flatMap(engineer => engineer.skills || [])
        );
        
        const missing = project.requiredSkills.filter(
          skill => !teamSkills.has(skill)
        );
        
        if (missing.length > 0) {
          missingSkills[project._id] = missing;
        }
      });
      
      setMissingSkillsMap(missingSkills);
    }
  }, [projects, assignments, engineers]);

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center py-8">Loading projects...</div>
      </div>
    );
  }

  const filteredProjects = projects?.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.requiredSkills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      try {
        await deleteProject(id);
        toast({
          title: 'Project deleted',
          description: `${name} has been removed from the system.`,
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to delete project. Please try again.',
          variant: 'destructive',
        });
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'planning':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-600 mt-2">Manage your engineering projects</p>
        </div>
        <CreateProjectDialog onSuccess={fetchProjects} />
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
          <Input
            placeholder="Search projects by name, description, or skills..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 max-w-md"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <div
            key={project._id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {project.name}
                </h3>
                <Badge className={getStatusColor(project.status)}>
                  {project.status}
                </Badge>
              </div>
              <p className="text-gray-600 mb-4 line-clamp-2">
                {project.description}
              </p>
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="h-4 w-4 mr-2" />
                  {new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Users className="h-4 w-4 mr-2" />
                  Team Size: {project.teamSize}
                </div>
              </div>
              
              {/* Required Skills Section */}
              <div className="mb-4">
                <div className="text-sm font-medium text-gray-700 mb-2">Required Skills:</div>
                <div className="flex flex-wrap gap-2">
                  {project.requiredSkills.map((skill) => (
                    <Badge 
                      key={skill} 
                      variant="secondary"
                      className={missingSkillsMap[project._id]?.includes(skill) 
                        ? 'bg-yellow-100 text-yellow-800 border-yellow-200' 
                        : 'bg-green-100 text-green-800 border-green-200'
                      }
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Missing Skills Warning */}
              {missingSkillsMap[project._id] && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-2 text-yellow-800 mb-2">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-sm font-medium">Missing Skills</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {missingSkillsMap[project._id].map((skill) => (
                      <Badge 
                        key={skill} 
                        variant="outline" 
                        className="bg-yellow-100 text-yellow-800 border-yellow-200"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedProject(project)}
                >
                  View Team
                </Button>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditProject(project)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleDelete(project._id, project.name)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedProject && (
        <ViewTeamDialog
          project={selectedProject}
          open={!!selectedProject}
          onOpenChange={(open) => !open && setSelectedProject(null)}
        />
      )}

      {editingProject && (
        <EditProjectDialog
          project={editingProject}
          open={!!editingProject}
          onOpenChange={(open) => !open && setEditingProject(null)}
          onSuccess={fetchProjects}
        />
      )}
    </div>
  );
};

export default ProjectsPage;
