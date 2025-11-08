import { useState, useEffect } from 'react';
import { Project, Task } from '../types';

const STORAGE_KEY = 'vznx_projects_v1';

type StoredTask = Partial<Task>;
type StoredProject = Partial<Project> & { tasks?: StoredTask[] };

const DAY = 24 * 60 * 60 * 1000;

function fallbackDueDate(offset: number) {
  const date = new Date(Date.now() + offset * DAY);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const DEFAULT_PROJECTS: Project[] = [
  {
    id: 'p1',
    name: 'Marketing Website Refresh',
    status: 'In Progress',
    progress: 50,
    tasks: [
      { id: 't1', name: 'Update hero copy', assignedTo: 'Aisha Khan', completed: true, dueDate: '2025-10-25' },
      { id: 't2', name: 'Design new CTA section', assignedTo: 'Raj Patel', completed: false, dueDate: '2025-11-20' },
    ],
    tags: ['Marketing', 'Website'],
  },
  {
    id: 'p2',
    name: 'Mobile App Launch Plan',
    status: 'In Progress',
    progress: 50,
    tasks: [
      { id: 't3', name: 'Finalize feature scope', assignedTo: 'Priya Singh', completed: true, dueDate: '2025-11-05' },
      { id: 't4', name: 'Coordinate beta testers', assignedTo: 'Omar Hassan', completed: false, dueDate: '2025-11-18' },
    ],
    tags: ['Product', 'Mobile'],
  },
  {
    id: 'p3',
    name: 'Customer Onboarding Revamp',
    status: 'Completed',
    progress: 100,
    tasks: [
      { id: 't5', name: 'Rewrite welcome emails', assignedTo: 'Elena Garcia', completed: true, dueDate: '2025-10-10' },
      { id: 't6', name: 'Record tutorial videos', assignedTo: 'Mateo Silva', completed: true, dueDate: '2025-10-12' },
    ],
    tags: ['Customer Success', 'Enablement'],
  },
  {
    id: 'p4',
    name: 'HR Policy Update',
    status: 'On Hold',
    progress: 0,
    tasks: [
      { id: 't7', name: 'Draft remote work guidelines', assignedTo: 'Li Wei', completed: false, dueDate: '2025-12-01' },
      { id: 't8', name: 'Review legal compliance', assignedTo: 'Fatima Noor', completed: false, dueDate: '2025-12-05' },
    ],
    tags: ['Operations', 'HR'],
  },
  {
    id: 'p5',
    name: 'Quarterly Budget Review',
    status: 'In Progress',
    progress: 50,
    tasks: [
      { id: 't9', name: 'Collect department reports', assignedTo: 'Jonas Muller', completed: true, dueDate: '2025-11-01' },
      { id: 't10', name: 'Prepare variance analysis', assignedTo: 'Sofia Rossi', completed: false, dueDate: '2025-11-15' },
    ],
    tags: ['Finance'],
  },
  {
    id: 'p6',
    name: 'Data Infrastructure Upgrade',
    status: 'In Progress',
    progress: 50,
    tasks: [
      { id: 't11', name: 'Audit current pipelines', assignedTo: 'Aisha Khan', completed: true, dueDate: '2025-10-28' },
      { id: 't12', name: 'Plan migration strategy', assignedTo: 'Omar Hassan', completed: false, dueDate: '2025-11-22' },
    ],
    tags: ['Engineering', 'Data'],
  },
  {
    id: 'p7',
    name: 'Client Success Playbook',
    status: 'In Progress',
    progress: 50,
    tasks: [
      { id: 't13', name: 'Interview top clients', assignedTo: 'Priya Singh', completed: false, dueDate: '2025-11-25' },
      { id: 't14', name: 'Document onboarding steps', assignedTo: 'Elena Garcia', completed: true, dueDate: '2025-11-02' },
    ],
    tags: ['Customer Success'],
  },
  {
    id: 'p8',
    name: 'Internal Tooling Automation',
    status: 'In Progress',
    progress: 50,
    tasks: [
      { id: 't15', name: 'Map manual workflows', assignedTo: 'Mateo Silva', completed: true, dueDate: '2025-10-30' },
      { id: 't16', name: 'Prototype automation scripts', assignedTo: 'Li Wei', completed: false, dueDate: '2025-11-28' },
    ],
    tags: ['Engineering', 'Automation'],
  },
  {
    id: 'p9',
    name: 'Brand Photography Shoot',
    status: 'On Hold',
    progress: 0,
    tasks: [
      { id: 't17', name: 'Source location options', assignedTo: 'Fatima Noor', completed: false, dueDate: '2025-12-10' },
      { id: 't18', name: 'Create shot list', assignedTo: 'Jonas Muller', completed: false, dueDate: '2025-12-05' },
    ],
    tags: ['Brand', 'Creative'],
  },
  {
    id: 'p10',
    name: 'Annual Conference Planning',
    status: 'In Progress',
    progress: 50,
    tasks: [
      { id: 't19', name: 'Secure keynote speaker', assignedTo: 'Sofia Rossi', completed: true, dueDate: '2025-10-22' },
      { id: 't20', name: 'Design attendee experience', assignedTo: 'Raj Patel', completed: false, dueDate: '2025-11-30' },
    ],
    tags: ['Events'],
  },
];

function calcProgress(tasks: Task[]): number {
  if (tasks.length === 0) return 0;
  const completedCount = tasks.filter((t) => t.completed).length;
  return Math.round((completedCount / tasks.length) * 100);
}

function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

function cloneProject(project: Project): Project {
  return {
    ...project,
    tags: [...project.tags],
    tasks: project.tasks.map((task) => ({ ...task })),
  };
}

function normalizeProject(raw: StoredProject): Project {
  const tasks: Task[] = Array.isArray(raw?.tasks)
    ? raw.tasks.map((task, index) => ({
        id: task?.id ?? generateId(),
        name: task?.name ?? 'Untitled task',
        assignedTo: task?.assignedTo,
        completed: Boolean(task?.completed),
        dueDate: task?.dueDate ?? fallbackDueDate(index + 3),
      }))
    : [];

  const progress = typeof raw?.progress === 'number' ? raw.progress : calcProgress(tasks);

  const status: Project['status'] = ['In Progress', 'Completed', 'On Hold'].includes(raw?.status as string)
    ? (raw?.status as Project['status'])
    : 'In Progress';

  return {
    id: raw?.id ?? generateId(),
    name: raw?.name ?? 'Untitled project',
    status,
    progress,
    tasks,
    tags: Array.isArray(raw?.tags) ? (raw.tags as string[]) : [],
  };
}

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setProjects(parsed.map(normalizeProject));
        } else {
          setProjects(DEFAULT_PROJECTS.map(cloneProject));
        }
      } catch {
        setProjects(DEFAULT_PROJECTS.map(cloneProject));
      }
    } else {
      setProjects(DEFAULT_PROJECTS.map(cloneProject));
    }
    setIsLoaded(true);
  }, []);

  const persist = (data: Project[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  };

  const addProject = (
    name: string,
    status: 'In Progress' | 'Completed' | 'On Hold' = 'In Progress',
    initialProgress: number = 0,
    tags: string[] = []
  ) => {
    const newProject: Project = {
      id: generateId(),
      name,
      status,
      progress: initialProgress,
      tasks: [],
      tags: [...tags],
    };
    const updated = [newProject, ...projects];
    setProjects(updated);
    persist(updated);
    return newProject;
  };

  const editProject = (id: string, updates: Partial<Omit<Project, 'id' | 'tasks' | 'progress'>>) => {
    const updated = projects.map((p) => {
      if (p.id !== id) return p;
      const nextTags = updates.tags ? [...updates.tags] : undefined;
      return { ...p, ...updates, ...(nextTags ? { tags: nextTags } : {}), updated_at: new Date() };
    });
    setProjects(updated);
    persist(updated);
  };

  const deleteProject = (id: string) => {
    const updated = projects.filter((p) => p.id !== id);
    setProjects(updated);
    persist(updated);
  };

  const addTask = (projectId: string, name: string, assignedTo?: string, dueDate?: string) => {
    const updated = projects.map((p) => {
      if (p.id === projectId) {
        const newTask: Task = {
          id: generateId(),
          name,
          assignedTo,
          completed: false,
          dueDate,
        };
        const newTasks = [...p.tasks, newTask];
        const newProgress = calcProgress(newTasks);
        return { ...p, tasks: newTasks, progress: newProgress };
      }
      return p;
    });
    setProjects(updated);
    persist(updated);
  };

  const toggleTask = (projectId: string, taskId: string) => {
    const updated = projects.map((p) => {
      if (p.id === projectId) {
        const newTasks = p.tasks.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t));
        const newProgress = calcProgress(newTasks);
        let newStatus = p.status;

        if (newProgress === 100 && p.status !== 'On Hold') {
          newStatus = 'Completed';
        } else if (newProgress < 100 && p.status === 'Completed') {
          newStatus = 'In Progress';
        }

        return { ...p, tasks: newTasks, progress: newProgress, status: newStatus };
      }
      return p;
    });
    setProjects(updated);
    persist(updated);
  };

  const deleteTask = (projectId: string, taskId: string) => {
    const updated = projects.map((p) => {
      if (p.id === projectId) {
        const newTasks = p.tasks.filter((t) => t.id !== taskId);
        const newProgress = calcProgress(newTasks);
        let newStatus = p.status;

        if (newProgress === 100 && p.status !== 'On Hold') {
          newStatus = 'Completed';
        } else if (newProgress < 100 && p.status === 'Completed') {
          newStatus = 'In Progress';
        }

        return { ...p, tasks: newTasks, progress: newProgress, status: newStatus };
      }
      return p;
    });
    setProjects(updated);
    persist(updated);
  };

  const setTasksCompletion = (projectId: string, taskIds: string[], completed: boolean) => {
    if (taskIds.length === 0) return;
    const ids = new Set(taskIds);

    const updated = projects.map((p) => {
      if (p.id !== projectId) return p;

      const newTasks = p.tasks.map((t) => (ids.has(t.id) ? { ...t, completed } : t));
      const newProgress = calcProgress(newTasks);
      let newStatus = p.status;

      if (newProgress === 100 && p.status !== 'On Hold') {
        newStatus = 'Completed';
      } else if (newProgress < 100 && p.status === 'Completed') {
        newStatus = 'In Progress';
      }

      return { ...p, tasks: newTasks, progress: newProgress, status: newStatus };
    });

    setProjects(updated);
    persist(updated);
  };

  const deleteTasksBulk = (projectId: string, taskIds: string[]) => {
    if (taskIds.length === 0) return;
    const ids = new Set(taskIds);

    const updated = projects.map((p) => {
      if (p.id !== projectId) return p;

      const newTasks = p.tasks.filter((t) => !ids.has(t.id));
      const newProgress = calcProgress(newTasks);
      let newStatus = p.status;

      if (newProgress === 100 && p.status !== 'On Hold') {
        newStatus = 'Completed';
      } else if (newProgress < 100 && p.status === 'Completed') {
        newStatus = 'In Progress';
      }

      return { ...p, tasks: newTasks, progress: newProgress, status: newStatus };
    });

    setProjects(updated);
    persist(updated);
  };

  const reorderTasks = (projectId: string, sourceIndex: number, destinationIndex: number) => {
    if (destinationIndex === sourceIndex) return;

    const updated = projects.map((p) => {
      if (p.id !== projectId) return p;

      const tasksCopy = Array.from(p.tasks);
      const [moved] = tasksCopy.splice(sourceIndex, 1);
      tasksCopy.splice(destinationIndex, 0, moved);
      return { ...p, tasks: tasksCopy };
    });

    setProjects(updated);
    persist(updated);
  };

  const resetDemoData = () => {
    const reset = DEFAULT_PROJECTS.map(cloneProject);
    setProjects(reset);
    persist(reset);
  };

  return {
    projects,
    isLoaded,
    addProject,
    editProject,
    deleteProject,
    addTask,
    toggleTask,
    deleteTask,
    setTasksCompletion,
    deleteTasksBulk,
    reorderTasks,
    resetDemoData,
  };
}
