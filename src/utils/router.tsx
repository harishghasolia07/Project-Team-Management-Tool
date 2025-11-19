import { useState, useEffect } from 'react';

export function useLocation() {
  const [location, setLocation] = useState(() => {
    // Initialize with current pathname
    return window.location.pathname || '/';
  });

  useEffect(() => {
    const handlePopState = () => {
      setLocation(window.location.pathname || '/');
    };

    // Listen for browser back/forward navigation
    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  return location;
}

export function Link({ to, children, className = '' }: { to: string; children: React.ReactNode; className?: string }) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    window.history.pushState({}, '', to);
    // Dispatch popstate event to update all location listeners
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  return (
    <a href={to} onClick={handleClick} className={className}>
      {children}
    </a>
  );
}

export function navigate(path: string) {
  window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

export function useParams() {
  const location = useLocation();
  const match = location.match(/^\/project\/([^/]+)$/);
  return match ? { id: match[1] } : {};
}
