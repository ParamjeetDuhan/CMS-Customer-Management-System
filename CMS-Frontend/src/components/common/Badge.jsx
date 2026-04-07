import { HiStar } from 'react-icons/hi';

/* ── Badge ──────────────────────────────── */
export const Badge = ({ children, variant = 'info', className = '' }) => {
  const variantMap = {
    success: 'badge-success',
    warning: 'badge-warning',
    error:   'badge-error',
    info:    'badge-info',
    primary: 'badge-primary',
    neutral: 'badge bg-brand-border text-gray-300',
  };
  return (
    <span className={`${variantMap[variant] || 'badge-info'} ${className}`}>
      {children}
    </span>
  );
};

/* ── Star Rating display ────────────────── */
export const StarRating = ({ rating = 0, max = 5, size = 'sm', showValue = false }) => {
  const sizeMap = { sm: 'w-3.5 h-3.5', md: 'w-4 h-4', lg: 'w-5 h-5' };
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: max }).map((_, i) => (
        <HiStar
          key={i}
          className={[
            sizeMap[size],
            i < Math.round(rating) ? 'text-amber-400' : 'text-brand-border',
          ].join(' ')}
        />
      ))}
      {showValue && (
        <span className="text-xs text-brand-muted ml-1">{Number(rating).toFixed(1)}</span>
      )}
    </div>
  );
};

/* ── Interactive Star Rating ─────────────── */
export const StarInput = ({ value, onChange, max = 5 }) => (
  <div className="flex items-center gap-1">
    {Array.from({ length: max }).map((_, i) => (
      <button
        key={i}
        type="button"
        onClick={() => onChange(i + 1)}
        className="focus:outline-none"
      >
        <HiStar
          className={[
            'w-7 h-7 transition-colors',
            i < value ? 'text-amber-400' : 'text-brand-border hover:text-amber-300',
          ].join(' ')}
        />
      </button>
    ))}
  </div>
);

/* ── Empty state ─────────────────────────── */
export const EmptyState = ({ icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
    {icon && <div className="text-5xl mb-4 opacity-50">{icon}</div>}
    <h3 className="font-display text-xl font-semibold text-white mb-2">{title}</h3>
    {description && <p className="text-brand-muted font-body max-w-sm mb-6">{description}</p>}
    {action}
  </div>
);

/* ── Error state ─────────────────────────── */
export const ErrorState = ({ message, onRetry }) => (
  <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
    <div className="text-5xl mb-4">⚠️</div>
    <h3 className="font-display text-xl font-semibold text-white mb-2">Something went wrong</h3>
    <p className="text-brand-muted font-body max-w-sm mb-6">{message || 'An unexpected error occurred.'}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="btn-primary"
      >
        Try Again
      </button>
    )}
  </div>
);
