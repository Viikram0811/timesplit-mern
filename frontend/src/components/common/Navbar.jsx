import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Logo from './Logo';
import { IconMenu, IconLogout, IconUser } from './Icons';

const Navbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();

  return (
    <div className="navbar bg-white shadow-md border-b border-gray-200">
      <div className="flex-none lg:hidden">
        <button
          className="btn btn-square btn-ghost text-gray-700"
          onClick={onMenuClick}
        >
          <IconMenu className="w-6 h-6" />
        </button>
      </div>
      <div className="flex-1">
        <Link to="/dashboard" className="btn btn-ghost px-2 hover:bg-gray-100">
          <Logo />
        </Link>
      </div>
      <div className="flex-none gap-4">
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end hidden sm:block">
            <span className="text-sm font-semibold text-gray-900">{user?.name}</span>
            <span className="text-xs text-gray-500">Student</span>
          </div>
          <div className="avatar placeholder">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full w-8">
              <span className="text-sm font-semibold">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={logout}
          className="btn btn-sm btn-outline btn-error gap-2 hover:bg-red-50"
        >
          <IconLogout className="w-4 h-4" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Navbar;
