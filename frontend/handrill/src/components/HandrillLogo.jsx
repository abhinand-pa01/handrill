/**
 * HandrillLogo — custom hand drill SVG icon.
 * Props:
 *   size    — pixel size of the bounding box (default 32)
 *   variant — "icon" | "full" | "white"
 *             icon  → drill icon only
 *             full  → icon + wordmark side by side
 *             white → full version in all-white (for dark backgrounds)
 */
export default function HandrillLogo({ size = 32, variant = 'icon', className = '' }) {
  const iconSize = size;

  const icon = (
    <svg
      width={iconSize}
      height={iconSize}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={variant === 'icon' ? className : ''}
    >
      {/* Background rounded square */}
      <rect width="64" height="64" rx="16" fill="url(#drillGrad)" />

      {/* Drill body — main barrel horizontal */}
      <rect x="8" y="26" width="30" height="12" rx="4" fill="white" fillOpacity="0.95" />

      {/* Drill chuck — front cone */}
      <path d="M38 28 L46 30 L46 34 L38 36 Z" fill="white" fillOpacity="0.85" />

      {/* Drill bit — long thin rod */}
      <rect x="46" y="31" width="12" height="2.5" rx="1.25" fill="white" fillOpacity="0.7" />

      {/* Drill handle — D-grip on top */}
      <path
        d="M14 26 C14 20 18 17 22 17 C26 17 28 20 28 24 L28 26 Z"
        fill="white"
        fillOpacity="0.9"
      />

      {/* Handle grip lines */}
      <line x1="17" y1="20" x2="17" y2="25" stroke="url(#drillGrad)" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.5" />
      <line x1="21" y1="18" x2="21" y2="25" stroke="url(#drillGrad)" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.5" />
      <line x1="25" y1="19" x2="25" y2="25" stroke="url(#drillGrad)" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.5" />

      {/* Trigger guard */}
      <path
        d="M16 38 L16 46 C16 47.1 16.9 48 18 48 L24 48 C25.1 48 26 47.1 26 46 L26 38"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        fillOpacity="0.9"
      />

      {/* Trigger button */}
      <rect x="19" y="36" width="6" height="4" rx="2" fill="white" fillOpacity="0.7" />

      {/* Ventilation dots on body */}
      <circle cx="20" cy="32" r="1.5" fill="url(#drillGrad)" fillOpacity="0.3" />
      <circle cx="25" cy="32" r="1.5" fill="url(#drillGrad)" fillOpacity="0.3" />
      <circle cx="30" cy="32" r="1.5" fill="url(#drillGrad)" fillOpacity="0.3" />

      {/* Bit tip spiral hint */}
      <line x1="50" y1="30.5" x2="55" y2="30.5" stroke="white" strokeWidth="1" strokeLinecap="round" strokeOpacity="0.5" />
      <line x1="52" y1="33.5" x2="57" y2="33.5" stroke="white" strokeWidth="1" strokeLinecap="round" strokeOpacity="0.5" />

      <defs>
        <linearGradient id="drillGrad" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1E3A8A" />
          <stop offset="60%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#14B8A6" />
        </linearGradient>
      </defs>
    </svg>
  );

  if (variant === 'icon') return icon;

  const isWhite = variant === 'white';
  const textColor = isWhite ? 'text-white' : 'text-brand-dark';
  const subColor  = isWhite ? 'text-white/70' : 'text-secondary';

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {icon}
      <div>
        <p className={`font-display font-bold leading-none ${textColor}`} style={{ fontSize: iconSize * 0.47 }}>
          Handrill
        </p>
        <p className={`font-body leading-none mt-0.5 ${subColor}`} style={{ fontSize: iconSize * 0.27 }}>
          Home Services
        </p>
      </div>
    </div>
  );
}
