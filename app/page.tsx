'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { GlassCard, Button } from '@/components/ui';
import { useAppStore } from '@/stores/useAppStore';
import { apiGetGroups, apiGetMyBalance, apiGetActivity } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';

export default function HomePage() {
  const groups = useAppStore((s) => s.groups);
  const setGroups = useAppStore((s) => s.setGroups);
  const myBalance = useAppStore((s) => s.myBalance);
  const setMyBalance = useAppStore((s) => s.setMyBalance);
  const activities = useAppStore((s) => s.activities);
  const setActivities = useAppStore((s) => s.setActivities);
  const currentUser = useAppStore((s) => s.currentUser);
  const loading = useAppStore((s) => s.loading);
  const setLoading = useAppStore((s) => s.setLoading);

  useEffect(() => {
    if (!currentUser) return;
    setLoading('home', true);

    Promise.all([
      apiGetGroups().then(setGroups).catch(() => {}),
      apiGetMyBalance().then(setMyBalance).catch(() => {}),
      apiGetActivity().then(setActivities).catch(() => {}),
    ]).finally(() => setLoading('home', false));
  }, [currentUser?.id]);

  const net = myBalance?.netBalance ?? 0;
  const totalOwed = myBalance?.totalOwed ?? 0;
  const totalOwing = myBalance?.totalOwing ?? 0;
  const hasData = groups.length > 0;
  const isLoading = loading['home'];

  // Extract recent expenses from activity events
  const recentExpenses = activities
    .filter((a: any) => a.type === 'expense_created')
    .slice(0, 5);

  if (!currentUser) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p style={{ color: 'var(--text-muted)' }}>Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-8">
      {/* Balance hero */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <GlassCard padding="lg" className="text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.06] pointer-events-none"
            style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-pink))' }} />
          <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Your Balance</p>
          <p className="text-4xl font-bold mb-5" style={{ color: net >= 0 ? 'var(--green)' : 'var(--red)' }}>
            {net >= 0 ? '+' : ''}{formatCurrency(net)}
          </p>
          <div className="flex justify-center gap-10 text-sm">
            <div>
              <p style={{ color: 'var(--text-muted)' }}>You are owed</p>
              <p className="text-lg font-bold" style={{ color: 'var(--green)' }}>{formatCurrency(totalOwed)}</p>
            </div>
            <div className="w-px" style={{ background: 'var(--glass-border)' }} />
            <div>
              <p style={{ color: 'var(--text-muted)' }}>You owe</p>
              <p className="text-lg font-bold" style={{ color: 'var(--red)' }}>{formatCurrency(totalOwing)}</p>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-4">
        <Link href="/expenses/new"><Button variant="primary" fullWidth size="lg">+ Add Expense</Button></Link>
        <Link href="/groups/new"><Button variant="secondary" fullWidth size="lg">+ New Group</Button></Link>
      </div>

      {/* Welcome state */}
      {!hasData && !isLoading && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <GlassCard padding="lg" className="text-center py-12">
            <p className="text-5xl mb-4">👋</p>
            <p className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Welcome to DutchWise!</p>
            <p className="text-sm mb-6 max-w-xs mx-auto" style={{ color: 'var(--text-secondary)' }}>
              Create your first group and start splitting expenses with friends and family.
            </p>
            <Link href="/groups/new"><Button size="lg">Create Your First Group</Button></Link>
          </GlassCard>
        </motion.div>
      )}

      {/* Groups */}
      {hasData && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Your Groups</h2>
            <Link href="/groups" className="text-sm font-medium" style={{ color: 'var(--accent)' }}>See all →</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {groups.slice(0, 3).map((group: any, i: number) => (
              <motion.div key={group.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                <Link href={`/groups/${group.id}`}>
                  <GlassCard hover padding="md">
                    <div className="flex items-start gap-3">
                      <span className="text-3xl">{group.icon}</span>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{group.name}</p>
                        <p className="text-xs truncate capitalize" style={{ color: 'var(--text-muted)' }}>{group.description || group.type}</p>
                        <p className="text-sm font-medium mt-2" style={{ color: 'var(--text-secondary)' }}>
                          {group.members?.length ?? 0} members · {group._count?.expenses ?? 0} expenses
                        </p>
                      </div>
                    </div>
                  </GlassCard>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Recent activity */}
      {recentExpenses.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Recent Activity</h2>
            <Link href="/activity" className="text-sm font-medium" style={{ color: 'var(--accent)' }}>View all →</Link>
          </div>
          <div className="space-y-3">
            {recentExpenses.map((act: any, i: number) => (
              <motion.div key={act.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
                <GlassCard hover padding="sm">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-2xl shrink-0">{act.group?.icon ?? '💰'}</span>
                      <div className="min-w-0">
                        <p className="font-medium truncate" style={{ color: 'var(--text-primary)' }}>{act.metadata?.title ?? 'Expense'}</p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{act.group?.name}</p>
                      </div>
                    </div>
                    {act.metadata?.amount && (
                      <span className="font-bold text-sm shrink-0 gradient-text">{formatCurrency(act.metadata.amount)}</span>
                    )}
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
