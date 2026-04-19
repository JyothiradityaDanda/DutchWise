'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

export interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

export default function BottomNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  const centerIdx = Math.floor(items.length / 2);

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40 md:hidden safe-b"
      style={{ background: 'var(--glass)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderTop: '1px solid var(--glass-border)' }}
    >
      <div className="flex items-center justify-around px-2 pt-2 pb-1">
        {items.map((item, i) => {
          const active = pathname === item.href;
          const isCenter = i === centerIdx;

          return (
            <Link key={item.href} href={item.href} className="flex flex-col items-center gap-0.5 min-w-[56px] py-1">
              <motion.div whileTap={{ scale: 0.85 }}>
                {isCenter ? (
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg -mt-4"
                    style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-pink))' }}
                  >
                    <span className="w-6 h-6">{item.icon}</span>
                  </div>
                ) : (
                  <>
                    <span className="w-6 h-6 block mx-auto" style={{ color: active ? 'var(--accent)' : 'var(--text-muted)' }}>
                      {item.icon}
                    </span>
                    <span className="text-[10px] font-medium" style={{ color: active ? 'var(--accent)' : 'var(--text-muted)' }}>
                      {item.label}
                    </span>
                  </>
                )}
              </motion.div>
              {active && !isCenter && (
                <motion.div
                  layoutId="navDot"
                  className="w-1 h-1 rounded-full mt-0.5"
                  style={{ background: 'var(--accent)' }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
