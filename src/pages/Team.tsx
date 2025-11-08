import { motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { useProjects } from '../hooks/useProjects';
import { CapacityBar } from '../components/CapacityBar';

type MemberInfo = {
  name: string;
  assigned: number;
  completed: number;
  capacity: number;
  tasks: Array<{
    projectId: string;
    projectName: string;
    taskId: string;
    taskName: string;
    completed: boolean;
    dueDate?: string;
  }>;
};

type MemberProjectGroup = {
  projectId: string;
  projectName: string;
  tasks: MemberInfo['tasks'];
};

const formatDate = (value?: string) => {
  if (!value) return '';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '';
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
  }).format(parsed);
};

export function Team() {
  const { projects } = useProjects();
  const [selectedMember, setSelectedMember] = useState<MemberInfo | null>(null);

  const teamMembers = useMemo<MemberInfo[]>(() => {
    const members: Record<
      string,
      {
        assigned: number;
        completed: number;
        tasks: MemberInfo['tasks'];
      }
    > = {};

    projects.forEach((project) => {
      project.tasks.forEach((task) => {
        const name = task.assignedTo || 'Unassigned';
        if (!members[name]) {
          members[name] = { assigned: 0, completed: 0, tasks: [] };
        }
        members[name].assigned += 1;
        if (task.completed) {
          members[name].completed += 1;
        }
        members[name].tasks.push({
          projectId: project.id,
          projectName: project.name,
          taskId: task.id,
          taskName: task.name,
          completed: task.completed,
          dueDate: task.dueDate,
        });
      });
    });

    return Object.entries(members)
      .map(([name, stats]) => {
        const remaining = Math.max(0, stats.assigned - stats.completed);
        const capacity = Math.min(100, Math.round((remaining / 5) * 100));
        return {
          name,
          assigned: stats.assigned,
          completed: stats.completed,
          capacity,
          tasks: stats.tasks,
        };
      })
      .sort((a, b) => b.assigned - a.assigned);
  }, [projects]);

  const selectedMemberProjects = useMemo<MemberProjectGroup[]>(() => {
    if (!selectedMember) return [];
    const groups = new Map<string, MemberProjectGroup>();
    selectedMember.tasks.forEach((task) => {
      if (!groups.has(task.projectId)) {
        groups.set(task.projectId, {
          projectId: task.projectId,
          projectName: task.projectName,
          tasks: [],
        });
      }
      groups.get(task.projectId)!.tasks.push(task);
    });
    return Array.from(groups.values());
  }, [selectedMember]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Team Overview</h1>
        <p className="text-gray-600 mt-1">View team members and their task capacity</p>
      </div>

      {teamMembers.length === 0 ? (
        <div className="text-center py-16">
          <div className="bg-gray-50 rounded-lg p-8 inline-block">
            <p className="text-gray-600 text-lg">No assigned tasks</p>
            <p className="text-gray-500 text-sm mt-1">Tasks will appear here as you assign them to team members</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {teamMembers.map((member, index) => (
            <motion.div
              key={member.name}
              className="cursor-pointer rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-slate-300"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05, ease: 'easeOut' }}
              whileHover={{ translateY: -4 }}
              role="button"
              tabIndex={0}
              onClick={() => setSelectedMember(member)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  setSelectedMember(member);
                }
              }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h3 className="truncate text-lg font-semibold text-gray-900">{member.name}</h3>
                </div>
                <div className="text-right text-xs text-gray-500 sm:text-sm">
                  <div>
                    <span className="font-medium text-gray-900">{member.assigned}</span> assigned
                  </div>
                  <div className="mt-1">
                    <span className="font-medium text-gray-900">{member.completed}</span> complete
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <CapacityBar value={member.capacity} />
              </div>
            </motion.div>
          ))}
        </div>
      )}
      {selectedMember && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
          onClick={() => setSelectedMember(null)}
        >
          <div
            className="relative w-full max-w-3xl rounded-2xl bg-white p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-6">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">{selectedMember.name}</h2>
                <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-gray-500">
                  <span>
                    <span className="font-medium text-gray-900">{selectedMember.assigned}</span> assigned
                  </span>
                  <span>
                    <span className="font-medium text-gray-900">{selectedMember.completed}</span> completed
                  </span>
                  <span>
                    Capacity {selectedMember.capacity}%
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedMember(null)}
                className="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                aria-label="Close team member details"
              >
                <X size={18} />
              </button>
            </div>

            {selectedMemberProjects.length === 0 ? (
              <p className="mt-6 text-sm text-gray-500">No tasks assigned yet.</p>
            ) : (
              <div className="mt-6 space-y-4">
                {selectedMemberProjects.map((project) => (
                  <div key={project.projectId} className="rounded-xl border border-gray-200 p-4">
                    <h3 className="text-sm font-semibold text-gray-900 sm:text-base">{project.projectName}</h3>
                    <ul className="mt-3 space-y-2 text-sm text-gray-600">
                      {project.tasks.map((task) => {
                        const due = formatDate(task.dueDate);
                        return (
                          <li
                            key={task.taskId}
                            className="flex flex-col gap-1 rounded-lg bg-gray-50 px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
                          >
                            <span className="font-medium text-gray-900">{task.taskName}</span>
                            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 sm:text-sm">
                              <span
                                className={`font-medium ${
                                  task.completed ? 'text-emerald-600' : 'text-amber-600'
                                }`}
                              >
                                {task.completed ? 'Completed' : 'In progress'}
                              </span>
                              {due && <span>Due {due}</span>}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
