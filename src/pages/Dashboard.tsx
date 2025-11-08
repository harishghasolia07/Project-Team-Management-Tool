import { useMemo, useState } from 'react';
import { Project } from '../types';
import { useProjects } from '../hooks/useProjects';
import { ProjectCard } from '../components/ProjectCard';
import { ProjectForm } from '../components/ProjectForm';
import { Plus, Search } from 'lucide-react';

export function Dashboard() {
  const { projects, addProject, editProject, deleteProject } = useProjects();
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'In Progress' | 'Completed' | 'On Hold'>('all');
  const [ownerQuery, setOwnerQuery] = useState('');

  const handleAddProject = (
    name: string,
    status: 'In Progress' | 'Completed' | 'On Hold',
    initialProgress: number = 0,
    tags: string[] = []
  ) => {
    addProject(name, status, initialProgress, tags);
    setShowForm(false);
  };

  const handleEditProject = (
    project: Project,
    name: string,
    status: 'In Progress' | 'Completed' | 'On Hold',
    tags: string[] = []
  ) => {
    editProject(project.id, { name, status, tags });
    setEditingProject(null);
  };

  const handleDeleteProject = (id: string) => {
    if (window.confirm(`Delete project? This will remove all tasks.`)) {
      deleteProject(id);
    }
  };

  const filteredProjects = useMemo(() => {
    const searchTerm = ownerQuery.trim().toLowerCase();
    return projects.filter((project) => {
      const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
      const matchesSearch =
        searchTerm.length === 0 ||
        project.name.toLowerCase().includes(searchTerm) ||
        project.tasks.some((task) => task.assignedTo?.toLowerCase().includes(searchTerm)) ||
        project.tags.some((tag) => tag.toLowerCase().includes(searchTerm));
      return matchesStatus && matchesSearch;
    });
  }, [projects, statusFilter, ownerQuery]);

  const statusOptions: Array<{ label: string; value: 'all' | 'In Progress' | 'Completed' | 'On Hold' }> = [
    { label: 'All', value: 'all' },
    { label: 'In Progress', value: 'In Progress' },
    { label: 'Completed', value: 'Completed' },
    { label: 'On Hold', value: 'On Hold' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-600 mt-1">Manage your projects and track progress</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors font-medium"
        >
          <Plus size={20} />
          Add Project
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-16">
          <div className="bg-gray-50 rounded-lg p-8 inline-block">
            <p className="text-gray-600 text-lg">No projects yet</p>
            <p className="text-gray-500 text-sm mt-1">Add your first project to get started</p>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              {statusOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setStatusFilter(option.value)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    statusFilter === option.value
                      ? 'bg-slate-900 text-white shadow'
                      : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:text-gray-900'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <div className="relative w-full max-w-xs">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="search"
                value={ownerQuery}
                onChange={(e) => setOwnerQuery(e.target.value)}
                placeholder="Search by owner"
                className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm text-gray-700 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>

          {filteredProjects.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-300 bg-white p-12 text-center text-gray-500">
              No projects match the current filters.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onEdit={() => setEditingProject(project)}
                  onDelete={() => handleDeleteProject(project.id)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {(showForm || editingProject) && (
        <ProjectForm
          project={editingProject || undefined}
          onSave={
            editingProject
              ? (name, status, _initialProgress, tags) => handleEditProject(editingProject, name, status, tags || [])
              : (name, status, initialProgress, tags) =>
                  handleAddProject(name, status, initialProgress ?? 0, tags || [])
          }
          onCancel={() => {
            setShowForm(false);
            setEditingProject(null);
          }}
        />
      )}
    </div>
  );
}
