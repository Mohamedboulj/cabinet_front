import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const MainLayout: React.FC = () => {
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const { user } = useAuth();

  return (
    <div className="min-h-screen surface-ground">
      <Topbar 
        onMenuToggle={() => setSidebarVisible(!sidebarVisible)} 
        user={user}
      />
      
      <div className="flex">
        <Sidebar 
          visible={sidebarVisible} 
          onHide={() => setSidebarVisible(false)}
          user={user}
        />
        
        <main 
          className={`flex-1 transition-all duration-300 ${
            sidebarVisible ? 'ml-64' : 'ml-0'
          }`}
          style={{ marginTop: '4rem' }}
        >
          <div className="p-4">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
