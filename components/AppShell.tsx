'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import BottomNav, { type NavItem } from './ui/BottomNav';
import { useAppStore } from '@/stores/useAppStore';
import { useDevice } from '@/hooks/useDevice';
import { apiAuthUser, setApiToken, getApiToken } from '@/lib/api';

const navItems: NavItem[] = [
  { label: 'Home', href: '/', icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg> },
  { label: 'Groups', href: '/groups', icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" /></svg> },
  { label: 'Add', href: '/expenses/new', icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg> },
  { label: 'Activity', href: '/activity', icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg> },
  { label: 'Profile', href: '/profile', icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg> },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const device = useDevice();
  const setAuth = useAppStore((s) => s.setAuth);
  const currentUser = useAppStore((s) => s.currentUser);

  // When Google OAuth session arrives, register/login with our API
  useEffect(() => {
    if (!session?.user?.email) return;
    if (currentUser?.email === session.user.email && getApiToken()) return;

    apiAuthUser(session.user.email, session.user.name ?? 'User', session.user.image)
      .then(({ user, token }) => {
        setApiToken(token);
        setAuth(user, token);
      })
      .catch(console.error);
  }, [session?.user?.email]);

  const isLogin = pathname === '/login';
  if (isLogin) return <>{children}</>;

  const showDesktopNav = device.isDesktop || device.isTablet;
  const showBottomNav = device.isMobile;

  return (
    <div className="min-h-dvh flex flex-col relative">
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-48 left-1/4 w-[500px] h-[500px] rounded-full blur-[120px] opacity-15 animate-pulse"
          style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-pink))' }} />
        <div className="absolute -bottom-48 right-1/4 w-[500px] h-[500px] rounded-full blur-[120px] opacity-15 animate-pulse"
          style={{ background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-purple))', animationDelay: '1.5s' }} />
      </div>

      {showDesktopNav && (
        <header className="hidden md:block fixed top-0 inset-x-0 z-40 safe-t"
          style={{ background: 'var(--glass)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderBottom: '1px solid var(--glass-border)' }}>
          <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="text-2xl">💰</span>
              <span className="text-xl font-bold gradient-text">DutchWise</span>
            </Link>
            <nav className="flex items-center gap-8">
              {navItems.filter((_, i) => i !== 2).map((item) => (
                <Link key={item.href} href={item.href}
                  className="text-sm font-medium transition-colors duration-200"
                  style={{ color: pathname === item.href ? 'var(--accent)' : 'var(--text-secondary)' }}>
                  {item.label}
                </Link>
              ))}
              <Link href="/expenses/new">
                <button className="px-4 py-2 text-sm font-semibold text-white rounded-lg"
                  style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-pink))' }}>
                  + Expense
                </button>
              </Link>
            </nav>
          </div>
        </header>
      )}

      <main className={`flex-1 relative z-10 ${showDesktopNav ? 'md:pt-20' : ''} ${showBottomNav ? 'pb-20' : ''}`}>
        {children}
      </main>

      {showBottomNav && <BottomNav items={navItems} />}
    </div>
  );
}
