import { Trash2 } from 'lucide-react';
import type { DraggableProvidedDragHandleProps, DraggableProvidedDraggableProps } from 'react-beautiful-dnd';
import { Task } from '../types';

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

type TaskItemProps = {
  task: Task;
  onToggle: () => void;
  onDelete: () => void;
  draggableProps?: DraggableProvidedDraggableProps;
  dragHandleProps?: DraggableProvidedDragHandleProps | null;
  innerRef?: (element: HTMLDivElement | null) => void;
  isDragging?: boolean;
  selectionMode?: boolean;
  selected?: boolean;
  onSelectionChange?: (checked: boolean) => void;
};

export function TaskItem({
  task,
  onToggle,
  onDelete,
  draggableProps,
  dragHandleProps,
  innerRef,
  isDragging,
  selectionMode,
  selected,
  onSelectionChange,
}: TaskItemProps) {
  const dueLabel = formatDueDate(task.dueDate);
  const isOverdue = task.dueDate ? new Date(task.dueDate) < new Date() && !task.completed : false;

  return (
    <div
      ref={innerRef}
      {...draggableProps}
      {...dragHandleProps}
      className={`flex items-center gap-4 p-4 rounded-lg border transition-colors ${
        task.completed
          ? 'bg-gray-50 border-gray-200'
          : 'bg-white border-gray-200 hover:border-gray-300'
      } ${isDragging ? 'ring-2 ring-slate-200' : ''}`}
      style={draggableProps?.style}
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
            <span className={`${isOverdue ? 'text-red-600 font-semibold' : 'text-gray-500'}`}>
              Due {dueLabel}
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
    </div>
  );
}
