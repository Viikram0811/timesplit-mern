import { useState, useEffect } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const checkbox = document.getElementById('drawer-toggle');
    if (checkbox) {
      checkbox.checked = sidebarOpen;
    }
  }, [sidebarOpen]);

  return (
    <div className="drawer lg:drawer-open">
      <input id="drawer-toggle" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col">
        <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-base-200">
          {children}
        </main>
      </div>
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
    </div>
  );
};

export default Layout;
