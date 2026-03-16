import { Link, useLocation } from 'react-router-dom';
import {
  IconChat,
  IconDashboard,
  IconUser,
  IconResources,
  IconSchedule,
  IconStress,
  IconTasks,
  IconClose,
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
    { path: '/profile', label: 'Profile', icon: IconUser },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="drawer-side">
      <label htmlFor="drawer-toggle" className="drawer-overlay" onClick={() => setIsOpen(false)}></label>
      <aside className="w-64 min-h-full bg-white border-r border-gray-200">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700">
            <div className="flex items-center gap-3">
              <Logo compact />
              <div className="font-semibold text-white tracking-tight">Time-Split</div>
            </div>
            <button
              className="btn btn-sm btn-circle btn-ghost text-white lg:hidden"
              onClick={() => setIsOpen(false)}
            >
              <IconClose className="w-5 h-5" />
            </button>
          </div>
          <ul className="menu p-4 w-full text-gray-700">
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`transition-colors ${
                    isActive(item.path)
                      ? 'bg-blue-100 text-blue-700 font-semibold active'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <item.icon className={`w-5 h-5 ${isActive(item.path) ? 'text-blue-600' : ''}`} />
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          
          {/* Footer Info */}
          <div className="mt-auto p-4 border-t border-gray-200 bg-blue-50">
            <p className="text-xs text-gray-600 mb-2">
              <strong>💡 Tip:</strong> Upload your study materials to get better AI answers!
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default Sidebar;
