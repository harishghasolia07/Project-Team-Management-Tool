import { motion } from 'framer-motion';
import { Edit2, Trash2 } from 'lucide-react';
import { Project } from '../types';
import { Link } from '../utils/router';

const STATUS_COLORS: Record<string, string> = {
  'In Progress': 'bg-blue-100 text-blue-800',
  Completed: 'bg-green-100 text-green-800',
  'On Hold': 'bg-amber-100 text-amber-800',
};

export function ProjectCard({ project, onEdit, onDelete }: { project: Project; onEdit: () => void; onDelete: () => void }) {
  const taskLabel = project.tasks.length === 1 ? '1 task' : `${project.tasks.length} tasks`;
  const tags = project.tags ?? [];

  return (
    <motion.div
      className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      whileHover={{ translateY: -4 }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-lg font-semibold text-gray-900">{project.name}</h3>
          <p className="mt-1 text-sm text-gray-500">{taskLabel}</p>
          {tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        <span className={`whitespace-nowrap rounded-full px-3 py-1 text-sm font-medium ${STATUS_COLORS[project.status]}`}>
          {project.status}
        </span>
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-end text-sm font-medium text-gray-500">
          {project.progress}% complete
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full rounded-full bg-slate-900 transition-all duration-300"
            style={{ width: `${project.progress}%` }}
          />
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={onEdit}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700"
            aria-label="Edit project"
          >
            <Edit2 size={18} />
          </button>
          <button
            onClick={onDelete}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600"
            aria-label="Delete project"
          >
            <Trash2 size={18} />
          </button>
        </div>
        <Link
          to={`/project/${project.id}`}
          className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800"
        >
          Open Project
        </Link>
      </div>
    </motion.div>
  );
}
