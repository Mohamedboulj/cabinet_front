import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';
import { PanelMenu } from 'primereact/panelmenu';
import { Sidebar as PrimeSidebar } from 'primereact/sidebar';
import type { User } from '@/types';

interface SidebarProps {
  visible: boolean;
  onHide: () => void;
  user: User | null;
}

const Sidebar: React.FC<SidebarProps> = ({ visible, onHide, user }) => {
  const { t } = useTranslation();

  const getMenuItems = () => {
    const items = [
      {
        label: t('sidebar.dashboard'),
        icon: 'pi pi-home',
        template: (item: any, options: any) => (
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `p-panelmenu-header-link ${isActive ? 'router-link-active' : ''}`
            }
            onClick={onHide}
          >
            <span className={options.iconClassName}></span>
            <span className={options.labelClassName}>{item.label}</span>
          </NavLink>
        ),
      },
      {
        label: t('sidebar.patients'),
        icon: 'pi pi-users',
        items: [
          {
            label: t('sidebar.patientList'),
            icon: 'pi pi-list',
            template: (item: any, options: any) => (
              <NavLink
                to="/patients"
                className={({ isActive }) =>
                  `p-menuitem-link ${isActive ? 'router-link-active' : ''}`
                }
                onClick={onHide}
              >
                <span className={options.iconClassName}></span>
                <span className={options.labelClassName}>{item.label}</span>
              </NavLink>
            ),
          },
          {
            label: t('sidebar.import'),
            icon: 'pi pi-upload',
            template: (item: any, options: any) => (
              <NavLink
                to="/patients/import"
                className={({ isActive }) =>
                  `p-menuitem-link ${isActive ? 'router-link-active' : ''}`
                }
                onClick={onHide}
              >
                <span className={options.iconClassName}></span>
                <span className={options.labelClassName}>{item.label}</span>
              </NavLink>
            ),
          },
        ],
      },
      {
        label: t('sidebar.appointments'),
        icon: 'pi pi-calendar',
        items: [
          {
            label: t('sidebar.list'),
            icon: 'pi pi-list',
            template: (item: any, options: any) => (
              <NavLink
                to="/appointments"
                className={({ isActive }) =>
                  `p-menuitem-link ${isActive ? 'router-link-active' : ''}`
                }
                onClick={onHide}
              >
                <span className={options.iconClassName}></span>
                <span className={options.labelClassName}>{item.label}</span>
              </NavLink>
            ),
          },
          {
            label: t('sidebar.calendar'),
            icon: 'pi pi-calendar-plus',
            template: (item: any, options: any) => (
              <NavLink
                to="/calendar"
                className={({ isActive }) =>
                  `p-menuitem-link ${isActive ? 'router-link-active' : ''}`
                }
                onClick={onHide}
              >
                <span className={options.iconClassName}></span>
                <span className={options.labelClassName}>{item.label}</span>
              </NavLink>
            ),
          },
        ],
      },
      {
        label: t('sidebar.consultations'),
        icon: 'pi pi-heart',
        template: (item: any, options: any) => (
          <NavLink
            to="/consultations"
            className={({ isActive }) =>
              `p-panelmenu-header-link ${isActive ? 'router-link-active' : ''}`
            }
            onClick={onHide}
          >
            <span className={options.iconClassName}></span>
            <span className={options.labelClassName}>{item.label}</span>
          </NavLink>
        ),
      },
      {
        label: t('sidebar.prescriptions'),
        icon: 'pi pi-file-edit',
        template: (item: any, options: any) => (
          <NavLink
            to="/prescriptions"
            className={({ isActive }) =>
              `p-panelmenu-header-link ${isActive ? 'router-link-active' : ''}`
            }
            onClick={onHide}
          >
            <span className={options.iconClassName}></span>
            <span className={options.labelClassName}>{item.label}</span>
          </NavLink>
        ),
      },
      {
        label: t('sidebar.invoices'),
        icon: 'pi pi-money-bill',
        template: (item: any, options: any) => (
          <NavLink
            to="/invoices"
            className={({ isActive }) =>
              `p-panelmenu-header-link ${isActive ? 'router-link-active' : ''}`
            }
            onClick={onHide}
          >
            <span className={options.iconClassName}></span>
            <span className={options.labelClassName}>{item.label}</span>
          </NavLink>
        ),
      },
    ];

    if (user?.roles.includes('ROLE_ADMIN')) {
      items.push({
        label: t('sidebar.users'),
        icon: 'pi pi-cog',
        template: (item: any, options: any) => (
          <NavLink
            to="/users"
            className={({ isActive }) =>
              `p-panelmenu-header-link ${isActive ? 'router-link-active' : ''}`
            }
            onClick={onHide}
          >
            <span className={options.iconClassName}></span>
            <span className={options.labelClassName}>{item.label}</span>
          </NavLink>
        ),
      });
    }

    items.push({
      label: t('sidebar.settings'),
      icon: 'pi pi-cog',
      template: (item: any, options: any) => (
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `p-panelmenu-header-link ${isActive ? 'router-link-active' : ''}`
          }
          onClick={onHide}
        >
          <span className={options.iconClassName}></span>
          <span className={options.labelClassName}>{item.label}</span>
        </NavLink>
      ),
    });

    return items;
  };

  return (
    <PrimeSidebar
      visible={visible}
      onHide={onHide}
      position="left"
      className="w-64"
      showCloseIcon={true}
    >
      <div className="p-3">
        <PanelMenu
          model={getMenuItems()}
          className="w-full"
          multiple
        />
      </div>
    </PrimeSidebar>
  );
};

export default Sidebar;
