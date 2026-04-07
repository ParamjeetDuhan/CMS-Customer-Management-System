import { forwardRef } from 'react';

const Input = forwardRef(({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  className = '',
  inputClassName = '',
  required,
  ...props
}, ref) => {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="label">
          {label}
          {required && <span className="text-primary-400 ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-muted pointer-events-none">
            {leftIcon}
          </span>
        )}
        <input
          ref={ref}
          className={[
            'input-field',
            leftIcon  ? 'pl-10'  : '',
            rightIcon ? 'pr-10'  : '',
            error     ? 'border-red-500 focus:border-red-500 focus:ring-red-500/30' : '',
            inputClassName,
          ].join(' ')}
          {...props}
        />
        {rightIcon && (
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-brand-muted">
            {rightIcon}
          </span>
        )}
      </div>
      {error && <p className="text-xs text-red-400 flex items-center gap-1">⚠ {error}</p>}
      {hint && !error && <p className="text-xs text-brand-muted">{hint}</p>}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
