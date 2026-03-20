import { Check } from 'lucide-react';

const STAGES = [
  { key: 'booked',   label: 'Booked',      desc: 'Request received' },
  { key: 'assigned', label: 'Assigned',     desc: 'Worker on the way' },
  { key: 'started',  label: 'In Progress',  desc: 'Work has begun' },
  { key: 'done',     label: 'Completed',    desc: 'Job finished' },
];

function getStageIndex(status) {
  const map = { PENDING: 0, ASSIGNED: 1, INPROGRESS: 2, COMPLETED: 3, CANCELLED: -1 };
  return map[status] ?? 0;
}

export default function Timeline({ booking }) {
  const currentIndex = getStageIndex(booking.status);
  if (booking.status === 'CANCELLED') {
    return (
      <div className="flex items-center gap-2 px-4 py-3 bg-red-50 rounded-xl border border-red-100">
        <div className="w-3 h-3 rounded-full bg-red-400 flex-shrink-0" />
        <span className="text-sm font-medium text-red-600 font-body">This booking was cancelled</span>
      </div>
    );
  }

  return (
    <div className="relative">
      {STAGES.map((stage, i) => {
        const done = i < currentIndex;
        const active = i === currentIndex;
        const pending = i > currentIndex;
        return (
          <div key={stage.key} className="flex gap-4 items-start">
            <div className="flex flex-col items-center">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors
                ${done ? 'bg-emerald-500' : active ? 'bg-brand-blue' : 'bg-slate-100'}
              `}>
                {done ? (
                  <Check size={14} className="text-white" />
                ) : active ? (
                  <div className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
                ) : (
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                )}
              </div>
              {i < STAGES.length - 1 && (
                <div className={`w-0.5 h-8 my-1 ${done ? 'bg-emerald-300' : 'bg-slate-100'}`} />
              )}
            </div>
            <div className="pb-8 pt-1">
              <p className={`text-sm font-semibold font-body ${done ? 'text-emerald-600' : active ? 'text-brand-blue' : 'text-muted'}`}>
                {stage.label}
              </p>
              <p className={`text-xs font-body mt-0.5 ${pending ? 'text-slate-300' : 'text-secondary'}`}>
                {stage.desc}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
