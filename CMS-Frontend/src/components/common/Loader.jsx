const Loader = ({ size = 'md', text, fullScreen = false, className = '' }) => {
  const sizeMap = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12', xl: 'w-16 h-16' };

  const spinner = (
    <div className={`relative ${sizeMap[size]}`}>
      <div className={`${sizeMap[size]} rounded-full border-2 border-brand-border`} />
      <div
        className={`${sizeMap[size]} rounded-full border-2 border-transparent border-t-primary-500 animate-spin absolute inset-0`}
      />
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-brand-bg/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center gap-4">
        {spinner}
        {text && <p className="text-brand-muted font-body text-sm animate-pulse">{text}</p>}
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      {spinner}
      {text && <p className="text-brand-muted font-body text-sm">{text}</p>}
    </div>
  );
};

export const SkeletonCard = () => (
  <div className="card p-4 space-y-3 animate-pulse">
    <div className="skeleton h-40 w-full rounded-xl" />
    <div className="skeleton h-4 w-3/4 rounded" />
    <div className="skeleton h-3 w-1/2 rounded" />
    <div className="flex justify-between items-center pt-1">
      <div className="skeleton h-5 w-20 rounded" />
      <div className="skeleton h-8 w-24 rounded-lg" />
    </div>
  </div>
);

export const SkeletonList = ({ count = 3 }) => (
  <div className="space-y-4">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="card p-4 flex gap-4 animate-pulse">
        <div className="skeleton h-16 w-16 rounded-xl flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="skeleton h-4 w-3/4 rounded" />
          <div className="skeleton h-3 w-1/2 rounded" />
          <div className="skeleton h-3 w-1/4 rounded" />
        </div>
      </div>
    ))}
  </div>
);

export const PageLoader = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <Loader size="lg" text="Loading…" />
  </div>
);

export default Loader;
