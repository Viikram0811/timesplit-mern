import { Link, useLocation } from 'react-router-dom';
import {
  IconChat,
  IconDashboard,
  IconProfile,
  IconResources,
  IconSchedule,
  IconStress,
  IconTasks,
} from './Icons';
import Logo from './Logo';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const location = useLocation();

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: IconDashboard },
    { path: '/tasks', label: 'Tasks', icon: IconTasks },
    { path: '/schedule', label: 'Schedule', icon: IconSchedule },
    { path: '/stress', label: 'Stress Tracking', icon: IconStress },
    { path: '/chatbot', label: 'AI Chatbot', icon: IconChat },
    { path: '/resources', label: 'Resources', icon: IconResources },
    { path: '/profile', label: 'Profile', icon: IconProfile },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="drawer-side">
      <label htmlFor="drawer-toggle" className="drawer-overlay" onClick={() => setIsOpen(false)}></label>
      <aside className="w-64 min-h-full bg-base-200">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-16 px-6 border-b border-base-300">
            <div className="flex items-center gap-3">
              <Logo compact />
              <div className="font-semibold tracking-tight">Time-Split</div>
            </div>
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
                  <item.icon className="w-5 h-5 opacity-90" />
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
