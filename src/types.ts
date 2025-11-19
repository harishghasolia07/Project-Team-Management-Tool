export interface Task {
  id: string;
  name: string;
  assignedTo?: string;
  completed: boolean;
  dueDate?: string;
}

export interface Project {
  id: string;
  name: string;
  status: 'In Progress' | 'Completed' | 'On Hold';
  progress: number;
  tasks: Task[];
  tags: string[];
}

export interface TeamMember {
  name: string;
  taskCount: number;
  capacity: number;
}