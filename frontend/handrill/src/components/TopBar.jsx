import { ArrowLeft, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function TopBar({ title, showBack = false, rightSlot, transparent = false }) {
  const navigate = useNavigate();

  return (
    <header className={`sticky top-0 z-30 ${transparent ? 'bg-transparent' : 'bg-white border-b border-border'}`}>
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
        {showBack && (
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full flex items-center justify-center text-secondary hover:bg-bg transition-colors flex-shrink-0"
          >
            <ArrowLeft size={20} />
          </button>
        )}
        {title && (
          <h1 className="font-display font-semibold text-primary text-base flex-1 truncate">{title}</h1>
        )}
        <div className="ml-auto flex items-center gap-2">
          {rightSlot}
        </div>
      </div>
    </header>
  );
}
