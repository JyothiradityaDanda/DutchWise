'use client';

import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', fullWidth, children, disabled, type = 'button', onClick, ...rest }, ref) => {
    return (
      <motion.button
        ref={ref}
        type={type}
        disabled={disabled}
        onClick={onClick}
        whileHover={disabled ? undefined : { scale: 1.03 }}
        whileTap={disabled ? undefined : { scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        className={cn(
          'inline-flex items-center justify-center font-semibold rounded-xl transition-colors duration-200',
          'disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          variant === 'primary' && 'text-white focus-visible:ring-indigo-400',
          variant === 'secondary' && 'text-white focus-visible:ring-pink-400',
          variant === 'ghost' && 'text-[var(--text-primary)] hover:bg-[var(--glass)] focus-visible:ring-[var(--accent)]',
          variant === 'danger' && 'bg-[var(--red)] text-white hover:opacity-90 focus-visible:ring-red-400',
          size === 'sm' && 'px-3.5 py-2 text-sm gap-1.5',
          size === 'md' && 'px-5 py-2.5 text-sm gap-2',
          size === 'lg' && 'px-7 py-3.5 text-base gap-2.5',
          fullWidth && 'w-full',
          className,
        )}
        style={
          variant === 'primary'
            ? { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }
            : variant === 'secondary'
              ? { background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }
              : undefined
        }
        {...rest}
      >
        {children}
      </motion.button>
    );
  },
);

Button.displayName = 'Button';
export default Button;
