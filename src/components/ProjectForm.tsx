import { useState, useMemo } from 'react';
import { Project } from '../types';
import { X } from 'lucide-react';
import { useProjects } from '../hooks/useProjects';

interface ProjectFormProps {
  project?: Project;
  onSave: (
    name: string,
    status: 'In Progress' | 'Completed' | 'On Hold',
    initialProgress?: number,
    tags?: string[]
  ) => void;
  onCancel: () => void;
}

export function ProjectForm({ project, onSave, onCancel }: ProjectFormProps) {
  const { projects } = useProjects();
  const [name, setName] = useState(project?.name || '');
  const [status, setStatus] = useState<'In Progress' | 'Completed' | 'On Hold'>(project?.status || 'In Progress');
  const [initialProgress, setInitialProgress] = useState(project?.progress || 0);
  const [tags, setTags] = useState<string[]>(project?.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [error, setError] = useState('');
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);

  const existingTags = useMemo(() => {
    const tagSet = new Set<string>();
    projects.forEach((p) => {
      if (p.id !== project?.id) {
        p.tags.forEach((tag) => tagSet.add(tag));
      }
    });
    return Array.from(tagSet).sort();
  }, [projects, project?.id]);

  const suggestedTags = useMemo(() => {
    if (!tagInput.trim()) return existingTags.slice(0, 5);
    const input = tagInput.toLowerCase();
    return existingTags.filter((tag) => tag.toLowerCase().includes(input)).slice(0, 5);
  }, [tagInput, existingTags]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Project name is required');
      return;
    }

    if (initialProgress < 0 || initialProgress > 100) {
      setError('Progress must be between 0 and 100');
      return;
    }

    const normalizedTags = Array.from(new Set(tags.map((tag) => tag.trim()).filter(Boolean)));
    onSave(name, status, project?.tasks.length === 0 ? initialProgress : undefined, normalizedTags);
  };

  const handleAddTag = () => {
    const value = tagInput.trim();
    if (!value) return;
    const exists = tags.some((tag) => tag.toLowerCase() === value.toLowerCase());
    if (!exists) {
      setTags((prev) => [...prev, value]);
    }
    setTagInput('');
  };

  const handleTagKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      handleAddTag();
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags((prev) => prev.filter((tag) => tag !== tagToRemove));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">{project ? 'Edit Project' : 'New Project'}</h2>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600" aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Project Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              placeholder="Enter project name"
            />
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as 'In Progress' | 'Completed' | 'On Hold')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
            >
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="On Hold">On Hold</option>
            </select>
          </div>

          {project?.tasks.length === 0 && (
            <div>
              <label htmlFor="progress" className="block text-sm font-medium text-gray-700 mb-2">
                Progress (%)
              </label>
              <input
                id="progress"
                type="number"
                min="0"
                max="100"
                value={initialProgress}
                onChange={(e) => setInitialProgress(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              />
            </div>
          )}

          {project?.tasks.length !== 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-900">Progress is derived from task completion when tasks exist.</p>
            </div>
          )}

          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="text-slate-500 transition-colors hover:text-slate-700"
                    aria-label={`Remove tag ${tag}`}
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
            <div className="space-y-2">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    id="tags"
                    type="text"
                    value={tagInput}
                    onChange={(e) => {
                      setTagInput(e.target.value);
                      setShowTagSuggestions(true);
                    }}
                    onKeyDown={handleTagKeyDown}
                    onFocus={() => setShowTagSuggestions(true)}
                    placeholder="Add a tag and press Enter"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                  />
                  {showTagSuggestions && suggestedTags.length > 0 && tagInput && (
                    <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                      {suggestedTags.map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => {
                            setTagInput(tag);
                            handleAddTag();
                            setTagInput('');
                            setShowTagSuggestions(false);
                          }}
                          className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:border-slate-300 hover:text-gray-900"
                >
                  Add
                </button>
              </div>
              {existingTags.length > 0 && tagInput === '' && (
                <div className="flex flex-wrap gap-1">
                  <span className="text-xs text-gray-500">Popular:</span>
                  {existingTags.slice(0, 5).map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        if (!tags.includes(tag)) {
                          setTags([...tags, tag]);
                        }
                      }}
                      className="px-2 py-0.5 text-xs font-medium text-blue-700 bg-blue-50 rounded hover:bg-blue-100 transition-colors"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              )}
              <p className="text-xs text-gray-500">Organize projects by category or team (e.g. Finance, Q4).</p>
            </div>
          </div>

          {error && <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">{error}</div>}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium"
            >
              {project ? 'Save' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
