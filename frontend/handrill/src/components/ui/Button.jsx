const VARIANTS = {
  primary:   'bg-brand-blue text-white hover:bg-blue-700 active:bg-blue-800',
  teal:      'bg-brand-teal text-white hover:bg-teal-600 active:bg-teal-700',
  secondary: 'bg-slate-100 text-primary hover:bg-slate-200 active:bg-slate-300',
  ghost:     'text-brand-blue hover:bg-blue-50 active:bg-blue-100',
  danger:    'bg-red-500 text-white hover:bg-red-600 active:bg-red-700',
  outline:   'border-2 border-brand-blue text-brand-blue hover:bg-blue-50 active:bg-blue-100',
  'outline-gray': 'border border-border text-secondary hover:bg-bg active:bg-slate-100',
};

const SIZES = {
  sm:  'px-3 py-2 text-sm rounded-lg',
  md:  'px-5 py-3 text-sm rounded-xl',
  lg:  'px-6 py-3.5 text-base rounded-xl',
  xl:  'px-8 py-4 text-base rounded-2xl',
};

export default function Button({
  children, variant = 'primary', size = 'md',
  fullWidth = false, loading = false, disabled = false,
  onClick, type = 'button', className = '', icon: Icon,
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center gap-2 font-body font-medium
        transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
        ${VARIANTS[variant] || VARIANTS.primary}
        ${SIZES[size] || SIZES.md}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      style={{ minHeight: '44px' }}
    >
      {loading ? (
        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : Icon ? (
        <Icon size={16} />
      ) : null}
      {children}
    </button>
  );
}
