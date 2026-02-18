import { useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const Layout = ({ children, scroll = true }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="drawer lg:drawer-open">
      <input
        id="drawer-toggle"
        type="checkbox"
        className="drawer-toggle"
        checked={sidebarOpen}
        onChange={(e) => setSidebarOpen(e.target.checked)}
      />
      <div className="drawer-content flex flex-col">
        <Navbar onMenuClick={() => setSidebarOpen((v) => !v)} />
        <main
          className={[
            'flex-1 p-4 md:p-6 lg:p-8 bg-base-200',
            scroll ? 'overflow-y-auto' : 'overflow-hidden',
          ].join(' ')}
        >
          {children}
        </main>
      </div>
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
    </div>
  );
};

export default Layout;
