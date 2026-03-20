/**
 * DemoBanner — a slim, non-intrusive strip shown when isDemo=true.
 * Blends with the app theme (uses brand palette, small text, transparent BG).
 * Only shown inside authenticated pages, not on auth screens.
 */
export default function DemoBanner({ role }) {
  return (
    <div className="bg-brand-dark/90 backdrop-blur-sm text-white/80 text-center py-1 px-4">
      <p className="text-[10px] font-body tracking-wide">
        <span className="font-semibold text-brand-teal">DEMO MODE</span>
        {' · '}
        Educational project · No real money · No real services
        {role === 'ADMIN' && ' · Admin view'}
      </p>
    </div>
  );
}
