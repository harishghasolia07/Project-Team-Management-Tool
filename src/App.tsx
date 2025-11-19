import { useEffect, useState } from 'react';
import { useLocation } from './utils/router';
import { useProjects } from './hooks/useProjects';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Landing } from './pages/Landing';
import { Dashboard } from './pages/Dashboard';
import { Projects } from './pages/Projects';
import { ProjectDetail } from './pages/ProjectDetail';
import { Team } from './pages/Team';

function App() {
  const location = useLocation();
  const { isLoaded } = useProjects();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isLoaded) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-slate-900 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const getPage = () => {
    if (location === '/' || location === '') {
      return <Landing />;
    }
    if (location === '/dashboard') {
      return <Dashboard />;
    }
    if (location === '/projects') {
      return <Projects />;
    }
    if (location === '/team') {
      return <Team />;
    }
    if (location.startsWith('/project/')) {
      return <ProjectDetail />;
    }
    return <Landing />;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-1">
        {getPage()}
      </main>
      <Footer />
    </div>
  );
}

export default App;
