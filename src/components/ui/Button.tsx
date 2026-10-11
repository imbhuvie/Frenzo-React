import { type ButtonHTMLAttributes, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import clsx from 'clsx';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  loading?: boolean;
  variant?: 'primary' | 'ghost';
  fullWidth?: boolean;
}

export default function Button({
  children,
  loading = false,
  variant = 'primary',
  fullWidth = false,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <motion.button
      whileHover={isDisabled ? {} : { scale: 1.015 }}
      whileTap={isDisabled ? {} : { scale: 0.985 }}
      disabled={isDisabled}
      className={clsx(
        'relative inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold',
        'transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a1a]',
        fullWidth && 'w-full',
        variant === 'primary' && [
          'bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 text-white',
          'shadow-lg shadow-violet-600/25',
          'hover:shadow-xl hover:shadow-violet-600/30',
          'focus-visible:ring-violet-500',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg disabled:hover:shadow-violet-600/25',
        ],
        variant === 'ghost' && [
          'text-slate-300 hover:text-white hover:bg-white/[0.06]',
          'focus-visible:ring-slate-500',
          'disabled:opacity-50 disabled:cursor-not-allowed',
        ],
        className
      )}
      {...(props as any)}
    >
      {loading && <Loader2 size={18} className="animate-spin" />}
      {children}
    </motion.button>
  );
}
