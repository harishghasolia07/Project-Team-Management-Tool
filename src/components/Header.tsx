import { useLocation, Link } from 'react-router-dom';
import { LayoutGrid, Users, Compass, FolderKanban } from 'lucide-react';

export function Header() {
  const location = useLocation();
  const dashboardActive = location.pathname === '/dashboard';
  const projectsActive = location.pathname === '/projects' || location.pathname.startsWith('/project/');
  const teamActive = location.pathname === '/team';

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-gradient-to-br from-slate-900 to-slate-700 rounded flex items-center justify-center">
              <span className="text-white font-bold text-sm">VZ</span>
            </div>
            <span className="font-semibold text-gray-900 text-lg">VZNX Mini</span>
          </Link>

          <nav className="flex gap-1">
            <Link
              to="/"
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                location.pathname === '/'
                  ? 'bg-slate-100 text-gray-900'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Compass size={18} />
              <span className="hidden sm:inline">Home</span>
            </Link>
            <Link
              to="/dashboard"
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                dashboardActive ? 'bg-slate-100 text-gray-900' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <LayoutGrid size={18} />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>
            <Link
              to="/projects"
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                projectsActive ? 'bg-slate-100 text-gray-900' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <FolderKanban size={18} />
              <span className="hidden sm:inline">Projects</span>
            </Link>
            <Link
              to="/team"
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                teamActive ? 'bg-slate-100 text-gray-900' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Users size={18} />
              <span className="hidden sm:inline">Team</span>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
