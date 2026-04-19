'use client';

import { getInitials } from '@/lib/utils';

const sizeMap = {
  sm: 'w-8 h-8 text-[11px]',
  md: 'w-10 h-10 text-xs',
  lg: 'w-12 h-12 text-sm',
  xl: 'w-16 h-16 text-lg',
} as const;

interface AvatarProps {
  src?: string;
  name: string;
  size?: keyof typeof sizeMap;
  className?: string;
}

export default function Avatar({ src, name, size = 'md', className }: AvatarProps) {
  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-full font-semibold text-white shrink-0 ${sizeMap[size]} ${className ?? ''}`}
      style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-purple))' }}
    >
      {src ? (
        <img src={src} alt={name} className="w-full h-full rounded-full object-cover" />
      ) : (
        <span>{getInitials(name)}</span>
      )}
    </div>
  );
}
