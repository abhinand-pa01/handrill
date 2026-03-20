import BottomNav from './BottomNav';
import DemoBanner from './DemoBanner';
import { useAuth } from '../context/AuthContext';

export default function AppLayout({ children }) {
  const { isDemo, user } = useAuth();

  return (
    <div className="min-h-screen bg-bg">
      <BottomNav />
      {/* Desktop: offset for sidebar */}
      <div className="md:ml-56">
        {/* Slim demo banner — only in demo mode, blends with theme */}
        {isDemo && <DemoBanner role={user?.role} />}
        <main className="pb-[72px] md:pb-0 min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}
