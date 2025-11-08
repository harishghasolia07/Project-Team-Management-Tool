import { useState, useEffect } from 'react';

export function useLocation() {
  const [location, setLocation] = useState(window.location.hash.slice(1) || '/');

  useEffect(() => {
    const handleHashChange = () => {
      setLocation(window.location.hash.slice(1) || '/');
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  return location;
}

export function Link({ to, children, className = '' }: { to: string; children: React.ReactNode; className?: string }) {
  return (
    <a href={`#${to}`} className={className}>
      {children}
    </a>
  );
}

export function navigate(path: string) {
  window.location.hash = path;
}

export function useParams() {
  const location = useLocation();
  const match = location.match(/^\/project\/([^/]+)$/);
  return match ? { id: match[1] } : {};
}
