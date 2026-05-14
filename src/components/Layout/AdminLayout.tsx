import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Target,
  BarChart2,
  LogOut,
  Radar,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

const NAV = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Panel' },
  { to: '/admin/ideal-profile', icon: Target, label: 'Perfil Ideal' },
  { to: '/admin/candidates', icon: Users, label: 'Candidatos' },
  { to: '/admin/results', icon: BarChart2, label: 'Resultados' },
];

export function AdminLayout() {
  const { config, logoutAdmin } = useAppStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutAdmin();
    navigate('/');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="flex w-56 flex-col border-r border-gray-200 bg-white">
        {/* Logo */}
        <div className="flex items-center gap-2 border-b border-gray-200 px-5 py-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
            <Radar size={16} />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">{config.organizationName}</p>
            <p className="text-xs text-gray-500">Admin</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-0.5 px-3 py-4">
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="border-t border-gray-200 p-3">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-red-50 hover:text-red-600"
          >
            <LogOut size={16} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
