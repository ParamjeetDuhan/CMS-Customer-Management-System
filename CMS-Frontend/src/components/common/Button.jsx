import { forwardRef } from 'react';

const sizeMap = {
  sm:  'px-4 py-2 text-sm',
  md:  'px-6 py-3 text-sm',
  lg:  'px-8 py-4 text-base',
  xl:  'px-10 py-4 text-lg',
  icon:'p-2.5',
};

const variantMap = {
  primary:  'bg-primary-500 hover:bg-primary-600 text-white shadow-glow hover:shadow-glow-lg',
  secondary:'bg-brand-card hover:bg-brand-border text-white border border-brand-border',
  ghost:    'text-primary-400 hover:bg-primary-500/10 hover:text-primary-300',
  danger:   'bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/30',
  outline:  'border border-primary-500 text-primary-400 hover:bg-primary-500 hover:text-white',
};

const Button = forwardRef(({
  children,
  variant  = 'primary',
  size     = 'md',
  loading  = false,
  disabled = false,
  fullWidth= false,
  className= '',
  leftIcon,
  rightIcon,
  ...props
}, ref) => {
  const base = [
    'inline-flex items-center justify-center gap-2 font-semibold font-body',
    'rounded-xl transition-all duration-200 active:scale-95',
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100',
    'focus:outline-none focus:ring-2 focus:ring-primary-500/40',
    sizeMap[size]     || sizeMap.md,
    variantMap[variant]|| variantMap.primary,
    fullWidth ? 'w-full' : '',
    className,
  ].join(' ');

  return (
    <button ref={ref} className={base} disabled={disabled || loading} {...props}>
      {loading ? (
        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : leftIcon}
      {children}
      {!loading && rightIcon}
    </button>
  );
});

Button.displayName = 'Button';
export default Button;
