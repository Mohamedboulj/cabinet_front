import { NavLink } from 'react-router-dom';
import { PanelMenu } from 'primereact/panelmenu';
import { Sidebar as PrimeSidebar } from 'primereact/sidebar';
import type { User } from '../../types';

interface SidebarProps {
  visible: boolean;
  onHide: () => void;
  user: User | null;
}

const Sidebar: React.FC<SidebarProps> = ({ visible, onHide, user }) => {
  const getMenuItems = () => {
    const items = [
      {
        label: 'Tableau de bord',
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
        label: 'Patients',
        icon: 'pi pi-users',
        items: [
          {
            label: 'Liste des patients',
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
            label: 'Import',
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
        label: 'Rendez-vous',
        icon: 'pi pi-calendar',
        items: [
          {
            label: 'Liste',
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
            label: 'Calendrier',
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
        label: 'Consultations',
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
        label: 'Ordonnances',
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
        label: 'Facturation',
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
        label: 'Utilisateurs',
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
      label: 'Paramètres',
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
