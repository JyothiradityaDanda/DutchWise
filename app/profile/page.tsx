'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { signOut } from 'next-auth/react';
import { GlassCard, Button, Avatar } from '@/components/ui';
import { useAppStore } from '@/stores/useAppStore';
import { apiGetMyBalance, apiUpdateMe } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';

export default function ProfilePage() {
  const currentUser = useAppStore((s) => s.currentUser);
  const myBalance = useAppStore((s) => s.myBalance);
  const setMyBalance = useAppStore((s) => s.setMyBalance);
  const theme = useAppStore((s) => s.theme);
  const setTheme = useAppStore((s) => s.setTheme);
  const clearAuth = useAppStore((s) => s.clearAuth);

  useEffect(() => {
    if (!currentUser) return;
    apiGetMyBalance().then(setMyBalance).catch(() => {});
  }, [currentUser?.id]);

  const handleThemeChange = (t: 'light' | 'dark' | 'system') => {
    setTheme(t);
    apiUpdateMe({ themePreference: t }).catch(() => {});
  };

  const handleSignOut = () => {
    clearAuth();
    signOut({ callbackUrl: '/login' });
  };

  if (!currentUser) {
    return <div className="max-w-3xl mx-auto px-4 py-16 text-center"><p style={{ color: 'var(--text-muted)' }}>Loading…</p></div>;
  }

  const net = myBalance?.netBalance ?? 0;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold gradient-text mb-1">Profile & Settings</h1>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <GlassCard padding="lg">
          <div className="flex items-center gap-5">
            <Avatar name={currentUser.name} src={currentUser.avatarUrl} size="xl" />
            <div className="min-w-0 flex-1">
              <p className="text-xl font-bold truncate" style={{ color: 'var(--text-primary)' }}>{currentUser.name}</p>
              <p className="text-sm truncate" style={{ color: 'var(--text-secondary)' }}>{currentUser.email}</p>
              <div className="flex gap-5 mt-3">
                {[
                  { label: 'Net', value: formatCurrency(net), color: net >= 0 ? 'var(--green)' : 'var(--red)' },
                  { label: 'Owed', value: formatCurrency(myBalance?.totalOwed ?? 0), color: 'var(--green)' },
                  { label: 'Owe', value: formatCurrency(myBalance?.totalOwing ?? 0), color: 'var(--red)' },
                ].map((s) => (
                  <div key={s.label}>
                    <p className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
                    <p className="text-base font-bold" style={{ color: s.color }}>{s.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <h2 className="text-lg font-bold mb-3" style={{ color: 'var(--text-primary)' }}>Appearance</h2>
        <GlassCard padding="lg">
          <div className="grid grid-cols-3 gap-3">
            {(['light', 'dark', 'system'] as const).map((t) => (
              <motion.button key={t} type="button" onClick={() => handleThemeChange(t)} whileTap={{ scale: 0.95 }}
                className="p-5 rounded-xl text-center transition-all"
                style={{ background: theme === t ? 'linear-gradient(135deg, var(--accent), var(--accent-pink))' : 'var(--bg-surface)', color: theme === t ? '#fff' : 'var(--text-primary)', border: theme === t ? 'none' : '1px solid var(--glass-border)' }}>
                <span className="text-2xl block mb-1">{t === 'light' ? '☀️' : t === 'dark' ? '🌙' : '💻'}</span>
                <span className="text-xs font-semibold capitalize">{t}</span>
              </motion.button>
            ))}
          </div>
        </GlassCard>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <GlassCard padding="lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>DutchWise</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Version 1.0.0</p>
            </div>
            <span className="text-3xl">💰</span>
          </div>
        </GlassCard>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Button variant="danger" fullWidth onClick={handleSignOut}>Sign Out</Button>
      </motion.div>
    </div>
  );
}
