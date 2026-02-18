import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Logo from './Logo';

const Navbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();

  return (
    <div className="navbar bg-base-100 shadow-lg">
      <div className="flex-none lg:hidden">
        <label htmlFor="drawer-toggle" className="btn btn-square btn-ghost" onClick={onMenuClick}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-6 h-6 stroke-current">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
        </label>
      </div>
      <div className="flex-1">
        <Link to="/dashboard" className="btn btn-ghost px-2">
          <Logo />
        </Link>
      </div>
      <div className="flex-none gap-2">
        <span className="text-sm text-base-content/70 hidden sm:block">{user?.name}</span>
        <button onClick={logout} className="btn btn-ghost">
          Logout
        </button>
      </div>
    </div>
  );
};

export default Navbar;
