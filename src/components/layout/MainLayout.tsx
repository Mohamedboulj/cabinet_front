import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '@/app/providers/AuthProvider';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const MainLayout: React.FC = () => {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const { user } = useAuth();

  return (
    <div className="min-h-screen surface-ground">
      <Topbar
        onMenuToggle={() => setSidebarVisible(!sidebarVisible)}
        user={user}
      />

      <Sidebar
        visible={sidebarVisible}
        onHide={() => setSidebarVisible(false)}
        user={user}
      />

      <main
        className="flex-1 transition-all duration-300"
        style={{ marginTop: '4rem', paddingLeft: '1rem' }}
      >
        <div className="p-4">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
