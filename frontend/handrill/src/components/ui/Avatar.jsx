const COLORS = [
  ['#2563EB', '#EFF6FF'],
  ['#14B8A6', '#F0FDFA'],
  ['#D97706', '#FFFBEB'],
  ['#7C3AED', '#F5F3FF'],
  ['#DC2626', '#FEF2F2'],
  ['#059669', '#ECFDF5'],
  ['#EA580C', '#FFF7ED'],
  ['#0891B2', '#ECFEFF'],
];

function hashName(name) {
  if (!name) return 0;
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash << 5) - hash + name.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function getInitials(name) {
  if (!name) return 'U';
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const SIZE_CLASSES = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-xl',
  '2xl': 'w-20 h-20 text-2xl',
};

export default function Avatar({ name, size = 'md', className = '', onClick }) {
  const index = hashName(name) % COLORS.length;
  const [textColor, bgColor] = COLORS[index];
  const initials = getInitials(name);
  const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES.md;

  return (
    <div
      className={`${sizeClass} rounded-full flex items-center justify-center font-display font-semibold flex-shrink-0 select-none ${className} ${onClick ? 'cursor-pointer' : ''}`}
      style={{ backgroundColor: bgColor, color: textColor }}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      aria-label={name}
    >
      {initials}
    </div>
  );
}
