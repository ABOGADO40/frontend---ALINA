import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderOpen,
  FileCheck,
  Upload,
  Download,
  Users,
  FileText,
  Search,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../features/auth/useAuth';
import logoAlina from '../../assets/logo-alina.jpeg';

const Sidebar = ({ isOpen, onClose }) => {
  const { isSuperAdmin } = useAuth();
  const location = useLocation();

  const isExactActive = (path) => location.pathname === path;

  const menuItems = [
    {
      section: 'Principal',
      color: 'alina',
      items: [
        { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, color: 'alina' }
      ]
    },
    {
      section: 'Evidencias',
      color: 'cyan',
      items: [
        { label: 'Mis Casos', path: '/cases', icon: FolderOpen, color: 'alina' },
        { label: 'Subir Evidencia', path: '/evidence/upload', icon: Upload, color: 'cyan' },
        { label: 'Mis Evidencias', path: '/evidence', icon: FileCheck, color: 'success', exact: true }
      ]
    },
    {
      section: 'Exportaciones',
      color: 'accent',
      items: [
        { label: 'Crear Exportacion', path: '/exports/create', icon: Download, color: 'accent' },
        { label: 'Mis Exportaciones', path: '/exports', icon: FileText, color: 'accent', exact: true }
      ]
    },
    {
      section: 'Verificacion',
      color: 'cyan',
      items: [
        { label: 'Verificar Hash', path: '/verify', icon: Search, color: 'cyan' }
      ]
    }
  ];

  const adminMenuItems = [
    {
      section: 'Administracion',
      color: 'danger',
      items: [
        { label: 'Usuarios', path: '/admin/users', icon: Users, color: 'accent' },
        { label: 'Auditoria', path: '/admin/audit', icon: FileText, color: 'danger' }
      ]
    }
  ];

  const allMenuItems = isSuperAdmin() ? [...menuItems, ...adminMenuItems] : menuItems;

  const iconActiveColors = {
    alina: 'bg-gradient-to-br from-alina-500 to-alina-600',
    cyan: 'bg-gradient-to-br from-cyan-500 to-cyan-600',
    success: 'bg-gradient-to-br from-success-500 to-success-600',
    accent: 'bg-gradient-to-br from-accent-500 to-accent-600',
    danger: 'bg-gradient-to-br from-danger-500 to-danger-600',
  };

  const iconInactiveColors = {
    alina: 'bg-alina-50 text-alina-600',
    cyan: 'bg-cyan-50 text-cyan-600',
    success: 'bg-success-50 text-success-600',
    accent: 'bg-accent-50 text-accent-600',
    danger: 'bg-danger-50 text-danger-600',
  };

  const activeBgColors = {
    alina: 'bg-alina-50/80 border-l-4 border-alina-500',
    cyan: 'bg-cyan-50/80 border-l-4 border-cyan-500',
    success: 'bg-success-50/80 border-l-4 border-success-500',
    accent: 'bg-accent-50/80 border-l-4 border-accent-500',
    danger: 'bg-danger-50/80 border-l-4 border-danger-500',
  };

  const sectionDotColors = {
    alina: 'bg-alina-500',
    cyan: 'bg-cyan-500',
    success: 'bg-success-500',
    accent: 'bg-accent-500',
    danger: 'bg-danger-500',
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-surface-100/20 backdrop-blur-sm z-30 lg:hidden animate-fade-in"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed top-16 left-0 bottom-0 w-72 z-30
          bg-white/95 border-r border-surface-700/30
          transform transition-all duration-300 ease-out
          lg:translate-x-0 shadow-soft
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        style={{ WebkitBackdropFilter: 'blur(16px)', backdropFilter: 'blur(16px)' }}
      >
        {/* Subtle top gradient wash */}
        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-alina-50/30 to-transparent pointer-events-none" />

        <nav className="h-full overflow-y-auto scrollbar-thin p-4 relative">
          {allMenuItems.map((section, sectionIndex) => (
            <div
              key={sectionIndex}
              className={`${sectionIndex > 0 ? 'mt-6' : ''} animate-fade-in-up`}
              style={{ animationDelay: `${sectionIndex * 80}ms` }}
            >
              <div className="flex items-center gap-2 px-3 mb-2.5">
                <div className={`w-1.5 h-1.5 rounded-full ${sectionDotColors[section.color]}`} />
                <h3 className="text-[11px] font-bold text-surface-400 uppercase tracking-widest">
                  {section.section}
                </h3>
              </div>

              <ul className="space-y-0.5">
                {section.items.map((item) => {
                  const isActive = item.exact
                    ? isExactActive(item.path)
                    : location.pathname === item.path || location.pathname.startsWith(item.path + '/');

                  return (
                    <li key={item.path}>
                      <NavLink
                        to={item.path}
                        onClick={onClose}
                        end={item.exact}
                        className={`
                          group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                          transition-all duration-300 ease-out relative
                          ${isActive
                            ? `${activeBgColors[item.color]} text-surface-100 shadow-sm`
                            : 'text-surface-400 hover:bg-alina-50/30 hover:text-surface-200'
                          }
                        `}
                      >
                        <div className={`
                          w-9 h-9 rounded-lg flex items-center justify-center
                          transition-all duration-300
                          ${isActive
                            ? `${iconActiveColors[item.color]} text-white shadow-sm`
                            : `${iconInactiveColors[item.color]} group-hover:shadow-sm`
                          }
                        `}>
                          <item.icon className="w-4 h-4" />
                        </div>

                        <span className="flex-1">{item.label}</span>

                        <ChevronRight className={`
                          w-4 h-4 transition-all duration-300
                          ${isActive
                            ? 'text-surface-400 opacity-100'
                            : 'opacity-0 -translate-x-2 group-hover:opacity-60 group-hover:translate-x-0 text-surface-500'
                          }
                        `} />
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}

          {/* Footer - Logo ALINA */}
          <div className="mt-8 pt-6 border-t border-surface-700/30">
            <div className="flex items-center justify-center px-3 py-3 rounded-xl bg-surface-900/40">
              <img
                src={logoAlina}
                alt="ALINA powered by SOFTIA"
                className="h-12 w-auto object-contain opacity-75"
              />
            </div>
            <p className="text-[10px] text-center text-surface-500 mt-2 tracking-wide">v1.0.0 - Evidencia Digital Segura</p>
          </div>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
