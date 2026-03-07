import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/app/providers/AuthProvider';
import { Menubar } from 'primereact/menubar';
import { Button } from 'primereact/button';
import { Avatar } from 'primereact/avatar';
import { Menu } from 'primereact/menu';
import type { User } from '@/types';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';

interface TopbarProps {
  onMenuToggle: () => void;
  user: User | null;
}

const Topbar: React.FC<TopbarProps> = ({ onMenuToggle, user }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { t } = useTranslation();
  const menuRef = useRef<Menu>(null);
  const [notifications] = useState(0);

  const handleLogout = () => {
    logout();
  };

  const userMenuItems = [
    {
      label: t('topbar.myProfile'),
      icon: 'pi pi-user',
      command: () => navigate('/settings'),
    },
    {
      separator: true,
    },
    {
      label: t('topbar.logout'),
      icon: 'pi pi-sign-out',
      command: handleLogout,
    },
  ];

  const getRoleLabel = () => {
    if (user?.roles.includes('ROLE_ADMIN')) return t('topbar.admin');
    if (user?.roles.includes('ROLE_MEDECIN')) return t('topbar.doctor');
    return t('topbar.secretary');
  };

  const start = (
    <div className="flex align-items-center">
      <Button
        icon="pi pi-bars"
        className="p-button-text p-button-rounded mr-2"
        onClick={onMenuToggle}
      />
      <div className="flex align-items-center">
        <i className="pi pi-heart-fill text-primary text-2xl mr-2"></i>
        <span className="text-xl font-bold text-primary">MediCare Pro</span>
      </div>
    </div>
  );

  const end = (
    <div className="flex align-items-center gap-2">
      <LanguageSwitcher />

      <Button
        icon="pi pi-bell"
        className="p-button-text p-button-rounded"
        badge={notifications > 0 ? notifications.toString() : undefined}
        badgeClassName="p-badge-danger"
        onClick={() => { }}
      />

      <div className="flex align-items-center gap-2 cursor-pointer" onClick={(e) => menuRef.current?.toggle(e)}>
        <Avatar
          label={user ? `${user.firstName[0]}${user.lastName[0]}` : 'U'}
          shape="circle"
          className="bg-primary text-white"
        />
        <div className="hidden md:block">
          <div className="font-medium">{user?.fullName || `${user?.firstName} ${user?.lastName}`}</div>
          <div className="text-sm text-500">{getRoleLabel()}</div>
        </div>
        <i className="pi pi-chevron-down text-sm"></i>
      </div>

      <Menu
        model={userMenuItems}
        popup
        ref={menuRef}
        className="w-48"
      />
    </div>
  );

  return (
    <header className="fixed top-0 left-0 right-0 surface-card border-bottom-1 surface-border" style={{ zIndex: 1000 }}>
      <Menubar
        start={start}
        end={end}
        className="border-none border-noround"
        style={{ padding: '0.5rem 1rem' }}
      />
    </header>
  );
};

export default Topbar;

