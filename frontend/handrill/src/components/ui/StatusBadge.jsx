const STATUS_CONFIG = {
  PENDING:    { label: 'Pending',     bg: 'bg-slate-100',   text: 'text-slate-600',  dot: 'bg-slate-400' },
  ASSIGNED:   { label: 'Assigned',    bg: 'bg-blue-100',    text: 'text-blue-700',   dot: 'bg-blue-500' },
  INPROGRESS: { label: 'In Progress', bg: 'bg-amber-100',   text: 'text-amber-700',  dot: 'bg-amber-500' },
  COMPLETED:  { label: 'Completed',   bg: 'bg-emerald-100', text: 'text-emerald-700',dot: 'bg-emerald-500' },
  CANCELLED:  { label: 'Cancelled',   bg: 'bg-red-100',     text: 'text-red-700',    dot: 'bg-red-400' },
};

export default function StatusBadge({ status, size = 'sm', pulse = false }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;
  const textSize = size === 'xs' ? 'text-xs' : 'text-xs';
  const padding = size === 'xs' ? 'px-2 py-0.5' : 'px-2.5 py-1';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-medium font-body ${textSize} ${padding} ${config.bg} ${config.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot} ${pulse && status === 'INPROGRESS' ? 'animate-pulse' : ''}`} />
      {config.label}
    </span>
  );
}
