import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Menu,
  X,
  User,
  LogOut,
  Settings,
  ChevronDown,
  Bell
} from 'lucide-react';
import { useAuth } from '../../features/auth/useAuth';
import logoAlina from '../../assets/logo-alina.jpeg';

const Navbar = ({ onMenuClick, isSidebarOpen }) => {
  const { user, logout, isSuperAdmin } = useAuth();
  const navigate = useNavigate();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 z-40 bg-white/85 backdrop-blur-xl border-b border-surface-700/30" style={{ WebkitBackdropFilter: 'blur(20px) saturate(180%)', backdropFilter: 'blur(20px) saturate(180%)' }}>
      {/* Gradient accent line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-alina-600 via-cyan-500 to-alina-600 opacity-70" />

      <div className="h-full px-4 flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2.5 text-surface-400 hover:text-alina-600 hover:bg-alina-50/50 rounded-xl transition-all duration-300"
            aria-label="Toggle menu"
          >
            {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          <Link to="/dashboard" className="flex items-center gap-3 group">
            <img
              src={logoAlina}
              alt="ALINA - Prueba Digital"
              className="h-10 w-auto object-contain group-hover:scale-105 transition-transform duration-300"
            />
          </Link>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <button className="relative p-2.5 text-surface-400 hover:text-alina-600 hover:bg-alina-50/50 rounded-xl transition-all duration-300">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-accent-500 rounded-full ring-2 ring-white" />
          </button>

          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-3 p-1.5 pr-3 rounded-xl hover:bg-alina-50/40 transition-all duration-300 group"
            >
              <div className="w-9 h-9 bg-gradient-to-br from-alina-600 to-cyan-600 rounded-xl flex items-center justify-center shadow-sm">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-semibold text-surface-100">{user?.fullName}</p>
                <p className="text-xs font-medium text-alina-600">
                  {isSuperAdmin() ? 'Administrador' : 'Cliente'}
                </p>
              </div>
              <ChevronDown className={`w-4 h-4 text-surface-400 hidden md:block transition-transform duration-300 ${userMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {userMenuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-float border border-surface-700/30 overflow-hidden z-20 animate-fade-in-down">
                  {/* Accent line */}
                  <div className="h-[2px] bg-gradient-to-r from-alina-600 via-cyan-500 to-alina-600 opacity-50" />
                  <div className="px-4 py-4 bg-gradient-to-r from-alina-50/60 to-cyan-50/40 border-b border-surface-700/30">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 bg-gradient-to-br from-alina-500 to-cyan-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-sm">
                        {user?.fullName?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <p className="font-semibold text-surface-100">{user?.fullName}</p>
                        <p className="text-sm text-surface-400">{user?.email}</p>
                      </div>
                    </div>
                  </div>

                  <div className="py-2">
                    <Link
                      to="/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-surface-300 hover:bg-alina-50/40 hover:text-alina-700 transition-all duration-200"
                    >
                      <div className="w-8 h-8 bg-alina-50 rounded-lg flex items-center justify-center">
                        <Settings className="w-4 h-4 text-alina-600" />
                      </div>
                      <span className="font-medium">Configuracion</span>
                    </Link>
                  </div>

                  <div className="border-t border-surface-700/30 py-2">
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-4 py-3 w-full text-left text-danger-600 hover:bg-danger-50/40 transition-all duration-200"
                    >
                      <div className="w-8 h-8 bg-danger-50 rounded-lg flex items-center justify-center">
                        <LogOut className="w-4 h-4 text-danger-500" />
                      </div>
                      <span className="font-medium">Cerrar Sesion</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
