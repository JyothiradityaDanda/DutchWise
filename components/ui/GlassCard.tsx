'use client';

import { type HTMLAttributes, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const padMap = { none: '', sm: 'p-3', md: 'p-5', lg: 'p-7' } as const;

export default function GlassCard({ className, hover, padding = 'md', children, ...rest }: GlassCardProps) {
  if (hover) {
    return (
      <motion.div
        whileHover={{ y: -3, scale: 1.01 }}
        transition={{ type: 'spring', stiffness: 400, damping: 22 }}
        className={cn('glass cursor-pointer', padMap[padding], className)}
        {...rest}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className={cn('glass', padMap[padding], className)} {...rest}>
      {children}
    </div>
  );
}
