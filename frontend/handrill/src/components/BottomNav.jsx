import { NavLink, useNavigate } from 'react-router-dom';
import { Home, CalendarDays, User, LayoutDashboard, Users, Briefcase, BarChart3, Plus, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import HandrillLogo from './HandrillLogo';

const CUSTOMER_TABS = [
  { path: '/customer',          icon: Home,          label: 'Home' },
  { path: '/customer/bookings', icon: CalendarDays,  label: 'Bookings' },
  { path: '/customer/book',     icon: Plus,          label: 'Book',   special: true },
  { path: '/customer/profile',  icon: User,          label: 'Profile' },
];

const WORKER_TABS = [
  { path: '/worker',          icon: Home,      label: 'Home' },
  { path: '/worker/jobs',     icon: Briefcase, label: 'Jobs' },
  { path: '/worker/stats',    icon: BarChart3, label: 'Stats' },
  { path: '/worker/profile',  icon: User,      label: 'Profile' },
];

const ADMIN_TABS = [
  { path: '/admin',           icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/admin/bookings',  icon: CalendarDays,    label: 'Bookings' },
  { path: '/admin/workers',   icon: Users,           label: 'Workers' },
  { path: '/admin/settings',  icon: Settings,        label: 'Settings' },
];

export default function BottomNav() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const tabs = user?.role === 'CUSTOMER' ? CUSTOMER_TABS
    : user?.role === 'WORKER' ? WORKER_TABS
    : ADMIN_TABS;

  return (
    <>
      {/* Mobile bottom nav */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white border-t border-border"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="max-w-2xl mx-auto flex items-stretch h-[60px]">
          {tabs.map(tab => {
            const Icon = tab.icon;
            if (tab.special) {
              return (
                <button key={tab.path} onClick={() => navigate(tab.path)}
                  className="flex-1 flex flex-col items-center justify-center">
                  <div className="w-12 h-12 -mt-5 rounded-2xl bg-brand-blue flex items-center justify-center shadow-lg shadow-blue-200">
                    <Icon size={22} className="text-white" />
                  </div>
                  <span className="text-[10px] font-medium text-brand-blue font-body mt-0.5">{tab.label}</span>
                </button>
              );
            }
            return (
              <NavLink key={tab.path} to={tab.path}
                end={['/', '/customer', '/worker', '/admin'].includes(tab.path)}
                className={({ isActive }) =>
                  `flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors ${isActive ? 'text-brand-blue' : 'text-muted'}`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon size={20} />
                    <span className={`text-[10px] font-medium font-body ${isActive ? 'text-brand-blue' : 'text-muted'}`}>
                      {tab.label}
                    </span>
                  </>
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* Desktop sidebar */}
      <nav className="hidden md:flex fixed left-0 top-0 bottom-0 w-56 bg-white border-r border-border flex-col z-40 shadow-sm">
        <div className="px-4 py-5 border-b border-border">
          <HandrillLogo size={36} variant="full" />
        </div>
        <div className="flex-1 py-4 overflow-y-auto">
          {tabs.map(tab => {
            const Icon = tab.icon;
            if (tab.special) {
              return (
                <button key={tab.path} onClick={() => navigate(tab.path)}
                  className="mx-3 mb-2 flex items-center gap-3 px-3 py-3 rounded-xl bg-brand-blue text-white w-[calc(100%-1.5rem)] hover:bg-blue-700 transition-colors">
                  <Icon size={18} />
                  <span className="text-sm font-semibold font-body">Book Service</span>
                </button>
              );
            }
            return (
              <NavLink key={tab.path} to={tab.path}
                end={['/', '/customer', '/worker', '/admin'].includes(tab.path)}
                className={({ isActive }) =>
                  `mx-3 mb-1 flex items-center gap-3 px-3 py-3 rounded-xl transition-colors ${
                    isActive ? 'bg-blue-50 text-brand-blue' : 'text-secondary hover:bg-bg hover:text-primary'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon size={18} className={isActive ? 'text-brand-blue' : ''} />
                    <span className="text-sm font-medium font-body">{tab.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </div>
        <div className="p-4 border-t border-border">
          <p className="text-xs text-muted font-body text-center">v2.0.0 · Kerala</p>
        </div>
      </nav>
    </>
  );
}
