import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-page">
      {/* Background atmospheric mesh */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-gradient-radial from-alina-500/6 to-transparent rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-[400px] h-[400px] bg-gradient-radial from-cyan-500/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] bg-gradient-radial from-alina-500/3 to-transparent rounded-full blur-3xl" />
        {/* Subtle dot pattern */}
        <div className="absolute inset-0 pattern-dots opacity-40" />
      </div>

      {/* Navbar */}
      <Navbar onMenuClick={toggleSidebar} isSidebarOpen={sidebarOpen} />

      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

      {/* Main content */}
      <main className="lg:ml-72 pt-16 min-h-screen relative">
        <div className="p-4 md:p-6 lg:p-8">
          <div className="animate-fade-in-up">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
