import { Link } from 'react-router-dom';
import { useProjects } from '../hooks/useProjects';
import { useMemo } from 'react';

const features = [
  {
    title: 'Plan With Clarity',
    description:
      'Visualize your projects, tasks, and owners all in one place so everyone knows what comes next.',
  },
  {
    title: 'Track Team Capacity',
    description:
      'See who is overbooked and who has room to help using real-time capacity insights.',
  },
  {
    title: 'Move Work Faster',
    description:
      'Reorder tasks, update progress, and collaborate in a few clicks with a focused, modern UI.',
  },
];

export function Landing() {
  const { projects } = useProjects();

  const snapshotData = useMemo(() => {
    // Active projects (In Progress)
    const activeProjects = projects.filter((p) => p.status === 'In Progress').length;

    // Calculate team capacity
    const memberStats: Record<string, { assigned: number; completed: number }> = {};
    projects.forEach((project) => {
      project.tasks.forEach((task) => {
        const member = task.assignedTo || 'Unassigned';
        if (!memberStats[member]) {
          memberStats[member] = { assigned: 0, completed: 0 };
        }
        memberStats[member].assigned += 1;
        if (task.completed) {
          memberStats[member].completed += 1;
        }
      });
    });

    // Calculate average capacity (based on remaining tasks vs a baseline of 5 tasks per person)
    const memberEntries = Object.entries(memberStats).filter(([member]) => member !== 'Unassigned');
    const totalMembers = memberEntries.length;
    
    if (totalMembers === 0) {
      return {
        activeProjects,
        teamCapacity: 0,
        upcomingMilestones: 0,
        todayDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      };
    }

    const avgRemainingTasks =
      memberEntries.reduce((sum, [, stats]) => sum + (stats.assigned - stats.completed), 0) / totalMembers;

    const teamCapacity = Math.min(100, Math.round((avgRemainingTasks / 5) * 100));

    // Calculate upcoming milestones (tasks due this week)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    const upcomingMilestones = projects.reduce((count, project) => {
      return (
        count +
        project.tasks.filter((task) => {
          if (!task.dueDate || task.completed) return false;
          const dueDate = new Date(task.dueDate);
          dueDate.setHours(0, 0, 0, 0);
          return dueDate >= today && dueDate <= nextWeek;
        }).length
      );
    }, 0);

    return {
      activeProjects,
      teamCapacity,
      upcomingMilestones,
      todayDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    };
  }, [projects]);

  return (
    <div className="bg-white">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 opacity-90" />
        <div className="relative mx-auto flex max-w-6xl flex-col-reverse gap-10 px-4 py-16 text-white sm:flex-row sm:items-center sm:justify-between sm:gap-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="max-w-xl space-y-6">
            <span className="inline-flex items-center rounded-full bg-white/10 px-4 py-1 text-sm font-medium text-indigo-200 ring-1 ring-white/20">
              VZNX Mini — Project & Team Management
            </span>
            <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
              Keep every project on track and every teammate in the loop.
            </h1>
            <p className="text-base text-indigo-100 sm:text-lg">
              VZNX Mini brings tasks, team capacity, and progress forecasting together so you can scale work
              without the busywork. Simple to adopt, powerful when you need it.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/dashboard"
                className="inline-flex items-center justify-center rounded-lg bg-white px-5 py-3 text-sm font-semibold text-slate-900 shadow-md transition hover:bg-slate-100"
              >
                Launch the App
              </Link>
              <a
                href="#learn-more"
                className="inline-flex items-center justify-center rounded-lg border border-white/40 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Explore features
              </a>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-md rounded-3xl bg-white/10 p-6 backdrop-blur">
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm text-indigo-100">
                <span>Today's snapshot</span>
                <span className="font-semibold text-white">{snapshotData.todayDate}</span>
              </div>
              <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/20">
                <p className="text-sm text-indigo-200">Active projects</p>
                <p className="mt-2 text-3xl font-semibold text-white">{snapshotData.activeProjects}</p>
                <div className="mt-4 space-y-3">
                  <div className="h-2 w-full rounded-full bg-white/10">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        snapshotData.teamCapacity >= 85
                          ? 'bg-red-400'
                          : snapshotData.teamCapacity >= 60
                          ? 'bg-amber-400'
                          : 'bg-emerald-400'
                      }`}
                      style={{ width: `${Math.min(100, snapshotData.teamCapacity)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-indigo-200">
                    <span>Team load</span>
                    <span>{snapshotData.teamCapacity}% capacity</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm text-indigo-100">
                <span>Upcoming milestones</span>
                <span>{snapshotData.upcomingMilestones} this week</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="learn-more" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-3xl space-y-4">
          <h2 className="text-3xl font-semibold text-gray-900">Why teams choose VZNX Mini</h2>
          <p className="text-gray-600">
            Replace scattered spreadsheets with a shared workspace that keeps everyone focused on the work that
            matters most.
          </p>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {features.map((feature) => (
            <div key={feature.title} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900">{feature.title}</h3>
              <p className="mt-3 text-sm text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-slate-900">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-4 py-16 text-white sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div className="max-w-xl space-y-3">
            <h2 className="text-2xl font-semibold sm:text-3xl">Ready to streamline your next launch?</h2>
            <p className="text-sm text-indigo-100">
              Start organizing projects, balancing workloads, and hitting milestones in minutes.
            </p>
          </div>
          <Link
            to="/dashboard"
            className="inline-flex items-center justify-center rounded-lg bg-white px-5 py-3 text-sm font-semibold text-slate-900 shadow-md transition hover:bg-slate-100"
          >
            Get started now
          </Link>
        </div>
      </section>
    </div>
  );
}

