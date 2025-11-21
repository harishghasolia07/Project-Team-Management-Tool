import { Trash2, AlertCircle, Clock } from 'lucide-react';
import { Task } from '../types';
import { motion } from 'framer-motion';

function formatDueDate(dueDate: string | undefined) {
  if (!dueDate) return '';
  const parsed = new Date(dueDate);
  if (Number.isNaN(parsed.getTime())) return '';
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(parsed);
}

function getDueDateStatus(dueDate: string | undefined, completed: boolean): 'overdue' | 'upcoming' | 'normal' | null {
  if (!dueDate || completed) return null;
  const due = new Date(dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  
  const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return 'overdue';
  if (diffDays <= 3) return 'upcoming';
  return 'normal';
}

type TaskItemProps = {
  task: Task;
  onToggle: () => void;
  onDelete: () => void;
  selectionMode?: boolean;
  selected?: boolean;
  onSelectionChange?: (checked: boolean) => void;
};

export function TaskItem({
  task,
  onToggle,
  onDelete,
  selectionMode,
  selected,
  onSelectionChange,
}: TaskItemProps) {
  const dueLabel = formatDueDate(task.dueDate);
  const dueStatus = getDueDateStatus(task.dueDate, task.completed);
  const isOverdue = dueStatus === 'overdue';
  const isUpcoming = dueStatus === 'upcoming';

  const baseClassName = `flex items-center gap-4 p-4 rounded-lg border transition-all ${
    task.completed
      ? 'bg-gray-50 border-gray-200'
      : isOverdue
      ? 'bg-red-50 border-red-200 hover:border-red-300'
      : isUpcoming
      ? 'bg-amber-50 border-amber-200 hover:border-amber-300'
      : 'bg-white border-gray-200 hover:border-gray-300'
  }`;

  return (
    <motion.div
      initial={false}
      animate={{
        opacity: task.completed ? 0.7 : 1,
      }}
      className={baseClassName}
    >
      <input
        type="checkbox"
        checked={task.completed}
        onChange={onToggle}
        className="w-5 h-5 rounded border-gray-300 cursor-pointer"
      />
      <div className="flex-1 min-w-0">
        <p
          className={`font-medium transition-all ${
            task.completed ? 'text-gray-400 line-through' : 'text-gray-900'
          }`}
        >
          {task.name}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
          {task.assignedTo && (
            <span className={task.completed ? 'text-gray-300' : 'text-gray-500'}>Assigned to {task.assignedTo}</span>
          )}
          {dueLabel && (
            <span className={`flex items-center gap-1 ${
              isOverdue 
                ? 'text-red-600 font-semibold' 
                : isUpcoming 
                ? 'text-amber-600 font-medium'
                : task.completed 
                ? 'text-gray-300' 
                : 'text-gray-500'
            }`}>
              {isOverdue && <AlertCircle size={14} />}
              {isUpcoming && !isOverdue && <Clock size={14} />}
              Due {dueLabel}
              {isOverdue && !task.completed && (
                <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded">Overdue</span>
              )}
              {isUpcoming && !isOverdue && (
                <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">Soon</span>
              )}
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {selectionMode && (
          <input
            type="checkbox"
            checked={selected}
            onChange={(e) => onSelectionChange?.(e.target.checked)}
            className="h-5 w-5 cursor-pointer rounded border-gray-300"
            aria-label={selected ? 'Deselect task' : 'Select task'}
          />
        )}
        <button
          onClick={onDelete}
          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
          aria-label="Delete task"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </motion.div>
  );
}
