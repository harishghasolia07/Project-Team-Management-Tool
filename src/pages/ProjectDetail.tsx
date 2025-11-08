import { useEffect, useMemo, useState } from 'react';
import { DragDropContext, Droppable, Draggable, type DropResult } from 'react-beautiful-dnd';
import { useProjects } from '../hooks/useProjects';
import { useParams, Link } from '../utils/router';
import { TaskItem } from '../components/TaskItem';
import { TaskForm } from '../components/TaskForm';
import { ArrowLeft } from 'lucide-react';
import type { Project, Task } from '../types';

type ForecastPoint = {
  label: string;
  planned: number;
  completed: number;
};

const STATUS_COLORS: Record<string, string> = {
  'In Progress': 'bg-blue-100 text-blue-800',
  Completed: 'bg-green-100 text-green-800',
  'On Hold': 'bg-amber-100 text-amber-800',
};

export function ProjectDetail() {
  const { id } = useParams();
  const { projects, addTask, toggleTask, deleteTask, editProject, reorderTasks, setTasksCompletion, deleteTasksBulk } =
    useProjects();
  const project = projects.find((p) => p.id === id);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [sortMode, setSortMode] = useState<'manual' | 'dueDate' | 'status'>('manual');
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);

  const handleDragEnd = (result: DropResult) => {
    if (!project || sortMode !== 'manual' || selectionMode) return;
    const { destination, source } = result;
    if (!destination) return;

    if (destination.index === source.index && destination.droppableId === source.droppableId) {
      return;
    }

    reorderTasks(project.id, source.index, destination.index);
  };

  const tasksToRender = useMemo(() => {
    if (!project) return [] as Task[];
    if (sortMode === 'manual') {
      return project.tasks;
    }

    const copy = [...project.tasks];

    if (sortMode === 'dueDate') {
      return copy.sort((a, b) => {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      });
    }

    const statusOrder: Record<Project['status'], number> = {
      'In Progress': 0,
      'On Hold': 1,
      Completed: 2,
    };

    return copy.sort((a, b) => {
      const statusA = a.completed ? 'Completed' : 'In Progress';
      const statusB = b.completed ? 'Completed' : 'In Progress';
      return statusOrder[statusA as Project['status']] - statusOrder[statusB as Project['status']];
    });
  }, [project, sortMode]);

  const forecastSummary = useMemo(() => {
    if (!project) {
      return { points: [] as ForecastPoint[], completedCount: 0, remainingCount: 0, nextDueLabel: undefined as string | undefined };
    }

    const tasks = project.tasks;
    if (tasks.length === 0) {
      return { points: [] as ForecastPoint[], completedCount: 0, remainingCount: 0, nextDueLabel: undefined as string | undefined };
    }

    const formatter = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' });
    const tasksWithDue = tasks
      .filter((task) => task.dueDate)
      .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime());

    let planned = 0;
    let done = 0;
    const points: ForecastPoint[] = [{ label: 'Start', planned: 0, completed: 0 }];

    tasksWithDue.forEach((task) => {
      planned += 1;
      if (task.completed) done += 1;
      points.push({ label: formatter.format(new Date(task.dueDate!)), planned, completed: done });
    });

    const withoutDue = tasks.filter((task) => !task.dueDate);
    if (withoutDue.length > 0) {
      planned += withoutDue.length;
      done += withoutDue.filter((task) => task.completed).length;
      points.push({ label: 'No due date', planned, completed: done });
    }

    const nextDueTask = tasksWithDue.find((task) => !task.completed);
    const completedCount = tasks.filter((task) => task.completed).length;

    return {
      points,
      completedCount,
      remainingCount: tasks.length - completedCount,
      nextDueLabel: nextDueTask ? formatter.format(new Date(nextDueTask.dueDate!)) : undefined,
    };
  }, [project]);

  const handleAddTask = (name: string, assignedTo?: string, dueDate?: string) => {
    if (!project) return;
    addTask(project.id, name, assignedTo, dueDate);
    setShowTaskForm(false);
  };

  const handleStatusChange = (newStatus: 'In Progress' | 'Completed' | 'On Hold') => {
    if (!project) return;
    editProject(project.id, { status: newStatus });
  };

  const handleSelectionToggle = (taskId: string, checked: boolean) => {
    setSelectedTaskIds((prev) => {
      if (checked) {
        return prev.includes(taskId) ? prev : [...prev, taskId];
      }
      return prev.filter((id) => id !== taskId);
    });
  };

  const clearSelection = () => setSelectedTaskIds([]);

  const handleToggleSelectionMode = () => {
    setSelectionMode((prev) => {
      if (prev) {
        clearSelection();
      }
      return !prev;
    });
  };

  const handleBulkComplete = () => {
    if (!project || selectedTaskIds.length === 0) return;
    setTasksCompletion(project.id, selectedTaskIds, true);
    clearSelection();
  };

  const handleBulkDelete = () => {
    if (!project || selectedTaskIds.length === 0) return;
    if (window.confirm(`Delete ${selectedTaskIds.length} selected task${selectedTaskIds.length > 1 ? 's' : ''}?`)) {
      deleteTasksBulk(project.id, selectedTaskIds);
      clearSelection();
    }
  };

  useEffect(() => {
    if (!project) return;
    setSelectedTaskIds((prev) => prev.filter((id) => project.tasks.some((task) => task.id === id)));
  }, [project]);

  const forecastPoints = forecastSummary.points;
  const completedCount = forecastSummary.completedCount;
  const remainingCount = forecastSummary.remainingCount;
  const nextDueLabel = forecastSummary.nextDueLabel;
  const hasForecastChart = forecastPoints.length > 1;
  const chartWidth = 360;
  const chartHeight = 140;
  const xStep = forecastPoints.length > 1 ? chartWidth / (forecastPoints.length - 1) : chartWidth;
  const maxValue = forecastPoints.length > 0 ? Math.max(1, ...forecastPoints.map((point) => Math.max(point.planned, point.completed))) : 1;
  const buildPath = (key: 'planned' | 'completed') =>
    forecastPoints
      .map((point, index) => {
        const x = index * xStep;
        const y = chartHeight - (point[key] / maxValue) * chartHeight;
        return `${index === 0 ? 'M' : 'L'}${x} ${y}`;
      })
      .join(' ');
  const plannedPath = hasForecastChart ? buildPath('planned') : '';
  const completedPath = hasForecastChart ? buildPath('completed') : '';

  if (!project) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to="/dashboard" className="flex items-center gap-2 text-slate-900 hover:text-slate-700 mb-8">
          <ArrowLeft size={20} />
          Back to Projects
        </Link>
        <div className="text-center py-16">
          <p className="text-gray-600 text-lg">Project not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/dashboard" className="flex items-center gap-2 text-slate-900 hover:text-slate-700 mb-8 font-medium">
        <ArrowLeft size={20} />
        Back to Projects
      </Link>

      <div className="mb-8 rounded-xl border border-gray-100 bg-white p-8 shadow-sm">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">{project.name}</h1>
            {project.tags.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                    {tag}
                  </span>
                ))}
              </div>
            )}
            <select
              value={project.status}
              onChange={(e) => handleStatusChange(e.target.value as 'In Progress' | 'Completed' | 'On Hold')}
              className={`px-3 py-1 rounded-full text-sm font-medium border-0 cursor-pointer ${STATUS_COLORS[project.status]}`}
            >
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="On Hold">On Hold</option>
            </select>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <span className="text-lg font-bold text-gray-900">{project.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-slate-900 h-3 rounded-full transition-all duration-300"
              style={{ width: `${project.progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="mb-8 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-gray-900">Progress Forecast</h2>
          {nextDueLabel && <span className="text-sm text-gray-500">Next due: {nextDueLabel}</span>}
        </div>
        {hasForecastChart ? (
          <>
            <svg
              className="mt-4 w-full"
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              role="img"
              aria-label="Burn-up chart showing planned vs completed tasks"
            >
              <path d={plannedPath} fill="none" stroke="#94a3b8" strokeWidth="2" />
              <path d={completedPath} fill="none" stroke="#0f172a" strokeWidth="2" />
              {forecastPoints.map((point, index) => {
                const x = index * xStep;
                const plannedY = chartHeight - (point.planned / maxValue) * chartHeight;
                const completedY = chartHeight - (point.completed / maxValue) * chartHeight;
                return (
                  <g key={`${point.label}-${index}`}>
                    <circle cx={x} cy={plannedY} r={3} fill="#94a3b8" />
                    <circle cx={x} cy={completedY} r={3} fill="#0f172a" />
                  </g>
                );
              })}
            </svg>
            <div className="mt-3 flex justify-between text-xs text-gray-500">
              {forecastPoints.map((point, index) => (
                <span key={`${point.label}-${index}`} className="truncate">
                  {point.label}
                </span>
              ))}
            </div>
          </>
        ) : (
          <p className="mt-4 text-sm text-gray-500">Add due dates to visualize the burn-up forecast.</p>
        )}
        <div className="mt-6 grid gap-3 text-sm sm:grid-cols-3">
          <div className="rounded-lg bg-slate-50 p-3">
            <span className="text-xs uppercase text-gray-500">Completed</span>
            <p className="mt-1 text-lg font-semibold text-slate-900">{completedCount}</p>
          </div>
          <div className="rounded-lg bg-slate-50 p-3">
            <span className="text-xs uppercase text-gray-500">Remaining</span>
            <p className="mt-1 text-lg font-semibold text-slate-900">{remainingCount}</p>
          </div>
          <div className="rounded-lg bg-slate-50 p-3">
            <span className="text-xs uppercase text-gray-500">Total tasks</span>
            <p className="mt-1 text-lg font-semibold text-slate-900">{project.tasks.length}</p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-slate-400"></span>
            Planned tasks
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-slate-900"></span>
            Completed tasks
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white p-8 shadow-sm">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-xl font-semibold text-gray-900">Tasks</h2>
          <div className="flex flex-1 flex-wrap items-center justify-end gap-3">
            <div className="flex items-center gap-2 text-sm">
              <label htmlFor="taskSort" className="text-sm text-gray-500">
                Sort by
              </label>
              <select
                id="taskSort"
                value={sortMode}
                onChange={(e) => setSortMode(e.target.value as 'manual' | 'dueDate' | 'status')}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
              >
                <option value="manual">Manual order</option>
                <option value="dueDate">Due date</option>
                <option value="status">Status</option>
              </select>
            </div>
            <button
              onClick={handleToggleSelectionMode}
              disabled={project.tasks.length === 0}
              className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                selectionMode
                  ? 'border-slate-200 bg-slate-100 text-slate-900'
                  : 'border-gray-300 text-gray-600 hover:border-slate-300 hover:text-gray-900'
              }`}
            >
              {selectionMode ? 'Cancel selection' : 'Select tasks'}
            </button>
            {selectionMode && selectedTaskIds.length > 0 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleBulkComplete}
                  className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-100"
                >
                  Mark complete ({selectedTaskIds.length})
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-100"
                >
                  Delete
                </button>
              </div>
            )}
            <button
              onClick={() => setShowTaskForm(true)}
              className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium"
            >
              Add Task
            </button>
          </div>
        </div>

        {project.tasks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No tasks yet</p>
            <p className="text-gray-500 text-sm mt-1">Add a task to start tracking progress</p>
          </div>
        ) : (
          sortMode === 'manual' && !selectionMode ? (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="tasks">
                {(droppableProvided) => (
                  <div ref={droppableProvided.innerRef} {...droppableProvided.droppableProps} className="space-y-3">
                    {tasksToRender.map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(draggableProvided, snapshot) => (
                          <TaskItem
                            task={task}
                            onToggle={() => toggleTask(project.id, task.id)}
                            onDelete={() => {
                              if (window.confirm(`Delete task "${task.name}"?`)) {
                                deleteTask(project.id, task.id);
                              }
                            }}
                            draggableProps={draggableProvided.draggableProps}
                            dragHandleProps={draggableProvided.dragHandleProps}
                            innerRef={draggableProvided.innerRef}
                            isDragging={snapshot.isDragging}
                            selectionMode={selectionMode}
                            selected={selectedTaskIds.includes(task.id)}
                            onSelectionChange={(checked) => handleSelectionToggle(task.id, checked)}
                          />
                        )}
                      </Draggable>
                    ))}
                    {droppableProvided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          ) : (
            <div className="space-y-3">
              {tasksToRender.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggle={() => toggleTask(project.id, task.id)}
                  onDelete={() => {
                    if (window.confirm(`Delete task "${task.name}"?`)) {
                      deleteTask(project.id, task.id);
                    }
                  }}
                  selectionMode={selectionMode}
                  selected={selectedTaskIds.includes(task.id)}
                  onSelectionChange={(checked) => handleSelectionToggle(task.id, checked)}
                />
              ))}
            </div>
          )
        )}

        {showTaskForm && (
          <TaskForm onSave={handleAddTask} onCancel={() => setShowTaskForm(false)} teamMembers={getTeamMembers(projects)} />
        )}
      </div>
    </div>
  );
}

function getTeamMembers(projects: Project[]): string[] {
  const members = new Set<string>();
  projects.forEach((p) => {
    p.tasks.forEach((t) => {
      if (t.assignedTo) members.add(t.assignedTo);
    });
  });
  return Array.from(members).sort();
}
