import { Link, useLocation } from 'react-router-dom';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const location = useLocation();

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/tasks', label: 'Tasks', icon: '✅' },
    { path: '/schedule', label: 'Schedule', icon: '📅' },
    { path: '/stress', label: 'Stress Tracking', icon: '😌' },
    { path: '/chatbot', label: 'AI Chatbot', icon: '💬' },
    { path: '/resources', label: 'Resources', icon: '📚' },
    { path: '/profile', label: 'Profile', icon: '👤' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="drawer-side">
      <label htmlFor="drawer-toggle" className="drawer-overlay" onClick={() => setIsOpen(false)}></label>
      <aside className="w-64 min-h-full bg-base-200">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-16 px-6 border-b border-base-300">
            <h2 className="text-lg font-semibold text-base-content">Menu</h2>
            <label htmlFor="drawer-toggle" className="btn btn-sm btn-circle btn-ghost lg:hidden" onClick={() => setIsOpen(false)}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </label>
          </div>
          <ul className="menu p-4 w-full text-base-content">
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={isActive(item.path) ? 'active' : ''}
                >
                  <span className="text-xl">{item.icon}</span>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  );
};

export default Sidebar;
