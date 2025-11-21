import { useMemo } from 'react';
import { useProjects } from '../hooks/useProjects';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, AlertCircle, CheckCircle2, TrendingUp, Users } from 'lucide-react';
import { motion } from 'framer-motion';

export function Dashboard() {
  const { projects } = useProjects();

  const stats = useMemo(() => {
    const totalProjects = projects.length;
    const inProgressProjects = projects.filter((p) => p.status === 'In Progress').length;
    const totalTasks = projects.reduce((sum, p) => sum + p.tasks.length, 0);
    const completedTasks = projects.reduce((sum, p) => sum + p.tasks.filter((t) => t.completed).length, 0);
    const activeTasks = projects.reduce((sum, p) => sum + p.tasks.filter((t) => !t.completed).length, 0);
    
    const overdueTasks = projects.reduce((sum, p) => {
      return sum + p.tasks.filter((t) => {
        if (!t.dueDate || t.completed) return false;
        return new Date(t.dueDate) < new Date();
      }).length;
    }, 0);

    const upcomingTasks = projects.reduce((sum, p) => {
      return sum + p.tasks.filter((t) => {
        if (!t.dueDate || t.completed) return false;
        const due = new Date(t.dueDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        due.setHours(0, 0, 0, 0);
        const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return diffDays >= 0 && diffDays <= 7;
      }).length;
    }, 0);

    const teamMembers = new Set<string>();
    projects.forEach((p) => {
      p.tasks.forEach((t) => {
        if (t.assignedTo) teamMembers.add(t.assignedTo);
      });
    });

    return {
      totalProjects,
      inProgressProjects,
      totalTasks,
      completedTasks,
      activeTasks,
      overdueTasks,
      upcomingTasks,
      teamMembersCount: teamMembers.size,
    };
  }, [projects]);

  const recentProjects = useMemo(() => {
    return projects
      .filter((p) => p.status === 'In Progress')
      .sort((a, b) => b.progress - a.progress)
      .slice(0, 6);
  }, [projects]);

  const upcomingTasksList = useMemo(() => {
    const allTasks = projects.flatMap((project) =>
      project.tasks
        .filter((t) => !t.completed && t.dueDate)
        .map((t) => ({
          ...t,
          projectId: project.id,
          projectName: project.name,
        }))
    );

    return allTasks
      .sort((a, b) => {
        if (!a.dueDate || !b.dueDate) return 0;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      })
      .slice(0, 5);
  }, [projects]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your projects</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Active Projects</span>
            <TrendingUp className="text-blue-500" size={20} />
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.inProgressProjects}</p>
          <p className="text-xs text-gray-500 mt-1">out of {stats.totalProjects} total</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Active Tasks</span>
            <CheckCircle2 className="text-green-500" size={20} />
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.activeTasks}</p>
          <p className="text-xs text-gray-500 mt-1">{stats.completedTasks} completed</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Overdue</span>
            <AlertCircle className="text-red-500" size={20} />
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.overdueTasks}</p>
          <p className="text-xs text-gray-500 mt-1">tasks need attention</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Team Members</span>
            <Users className="text-purple-500" size={20} />
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.teamMembersCount}</p>
          <p className="text-xs text-gray-500 mt-1">actively assigned</p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Projects */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Active Projects</h2>
              <Link
                to="/projects"
                className="flex items-center gap-1 text-sm font-medium text-slate-900 hover:text-slate-700 transition-colors"
              >
                View all
                <ArrowRight size={16} />
              </Link>
            </div>
            {recentProjects.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600">No active projects</p>
                <Link to="/projects" className="text-sm text-slate-900 hover:underline mt-2 inline-block">
                  Create your first project
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recentProjects.map((project) => (
                  <Link key={project.id} to={`/project/${project.id}`} className="block">
                    <div className="rounded-lg border border-gray-200 p-4 hover:border-slate-300 hover:shadow-md transition-all">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-900 truncate flex-1">{project.name}</h3>
                        <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${
                          project.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                          project.status === 'Completed' ? 'bg-green-100 text-green-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {project.status}
                        </span>
                      </div>
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                          <span>{project.progress}% complete</span>
                          <span>{project.tasks.filter(t => !t.completed).length} active tasks</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-slate-900 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${project.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div>
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Upcoming Deadlines</h2>
              <Calendar className="text-gray-400" size={20} />
            </div>
            {upcomingTasksList.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-gray-500">No upcoming deadlines</p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingTasksList.map((task, index) => {
                  const dueDate = task.dueDate ? new Date(task.dueDate) : null;
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  const due = dueDate ? new Date(dueDate) : null;
                  if (due) due.setHours(0, 0, 0, 0);
                  
                  const diffDays = due && dueDate
                    ? Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
                    : null;
                  
                  const isOverdue = diffDays !== null && diffDays < 0;
                  const isSoon = diffDays !== null && diffDays <= 3 && diffDays >= 0;

                  return (
                    <Link
                      key={`${task.projectId}-${task.id}`}
                      to={`/project/${task.projectId}`}
                      className="block"
                    >
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className={`rounded-lg border p-3 hover:shadow-md transition-all ${
                          isOverdue
                            ? 'border-red-200 bg-red-50'
                            : isSoon
                            ? 'border-amber-200 bg-amber-50'
                            : 'border-gray-200 bg-gray-50'
                        }`}
                      >
                        <p className="font-medium text-sm text-gray-900 truncate">{task.name}</p>
                        <p className="text-xs text-gray-500 mt-1 truncate">{task.projectName}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className={`text-xs font-medium ${
                            isOverdue
                              ? 'text-red-700'
                              : isSoon
                              ? 'text-amber-700'
                              : 'text-gray-600'
                          }`}>
                            {isOverdue
                              ? `${Math.abs(diffDays!)} day${Math.abs(diffDays!) !== 1 ? 's' : ''} overdue`
                              : diffDays === 0
                              ? 'Due today'
                              : diffDays === 1
                              ? 'Due tomorrow'
                              : `Due in ${diffDays} days`}
                          </span>
                          {task.assignedTo && (
                            <span className="text-xs text-gray-500">{task.assignedTo}</span>
                          )}
                        </div>
                      </motion.div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
