import { useState, useMemo, useEffect } from 'react';
import { X, Sparkles, Clock } from 'lucide-react';
import { useProjects } from '../hooks/useProjects';

interface TaskFormProps {
  onSave: (name: string, assignedTo?: string, dueDate?: string) => void;
  onCancel: () => void;
  teamMembers: string[];
  projectId?: string;
}

export function TaskForm({ onSave, onCancel, teamMembers }: TaskFormProps) {
  const { projects } = useProjects();
  const [name, setName] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const suggestedMembers = useMemo(() => {
    if (teamMembers.length === 0) return [];
    
    const memberStats = teamMembers.map((member) => {
      const tasks = projects.reduce((acc, project) => {
        return acc + project.tasks.filter((t) => t.assignedTo === member && !t.completed).length;
      }, 0);
      return { member, taskCount: tasks };
    });

    const sortedByCapacity = memberStats.sort((a, b) => a.taskCount - b.taskCount);
    return sortedByCapacity.slice(0, 3).map((s) => s.member);
  }, [teamMembers, projects]);

  const suggestedDueDate = useMemo(() => {
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    return nextWeek.toISOString().split('T')[0];
  }, []);

  useEffect(() => {
    if (assignedTo.length > 0) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [assignedTo]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Task name is required');
      return;
    }

    onSave(name, assignedTo || undefined, dueDate || undefined);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Add Task</h2>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600" aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="taskName" className="block text-sm font-medium text-gray-700 mb-2">
              Task Name
            </label>
            <input
              id="taskName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              placeholder="Enter task name"
              autoFocus
            />
          </div>

          <div>
            <label htmlFor="assignedTo" className="block text-sm font-medium text-gray-700 mb-2">
              Assign to (optional)
            </label>
            <div className="relative">
              <input
                id="assignedTo"
                type="text"
                list="team-members"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                placeholder="Select or type name"
              />
              <datalist id="team-members">
                {teamMembers.map((member) => (
                  <option key={member} value={member} />
                ))}
              </datalist>
              
              {suggestedMembers.length > 0 && showSuggestions && !assignedTo && (
                <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles size={14} className="text-blue-600" />
                    <span className="text-xs font-medium text-blue-900">Suggested (lowest workload)</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {suggestedMembers.map((member) => (
                      <button
                        key={member}
                        type="button"
                        onClick={() => {
                          setAssignedTo(member);
                          setShowSuggestions(false);
                        }}
                        className="px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded hover:bg-blue-200 transition-colors"
                      >
                        {member}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-2">
              Due date (optional)
            </label>
            <div className="space-y-2">
              <input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              />
              {!dueDate && (
                <button
                  type="button"
                  onClick={() => setDueDate(suggestedDueDate)}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Clock size={12} />
                  Suggest: 1 week from now
                </button>
              )}
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
            <button type="submit" className="flex-1 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium">
              Add Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
