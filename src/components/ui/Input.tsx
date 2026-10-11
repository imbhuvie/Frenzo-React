import { useState, forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import clsx from 'clsx';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: ReactNode;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, icon, error, type, className, ...props }, ref) => {
    const [focused, setFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const inputType = isPassword && showPassword ? 'text' : type;

    return (
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-slate-300 pl-1">
          {label}
        </label>
        <div className="relative">
          {icon && (
            <span
              className={clsx(
                'absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-200',
                focused ? 'text-violet-400' : 'text-slate-500'
              )}
            >
              {icon}
            </span>
          )}
          <input
            ref={ref}
            type={inputType}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className={clsx(
              'w-full rounded-xl border bg-white/[0.04] px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500',
              'transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:bg-white/[0.06]',
              icon && 'pl-11',
              isPassword && 'pr-11',
              error
                ? 'border-rose-500/50 focus:ring-rose-500/30 focus:border-rose-500/60'
                : 'border-white/[0.08] focus:ring-violet-500/30 focus:border-violet-500/50',
              className
            )}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          )}
        </div>
        {error && (
          <p className="text-xs text-rose-400 pl-1 mt-1">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
