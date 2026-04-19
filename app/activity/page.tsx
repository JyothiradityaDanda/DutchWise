'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '@/components/ui';
import { useAppStore } from '@/stores/useAppStore';
import { apiGetActivity } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';

const typeIcons: Record<string, string> = {
  expense_created: '💰', expense_updated: '✏️', expense_deleted: '🗑️',
  member_added: '👤', settlement_recorded: '✅', group_created: '🎉',
};

export default function ActivityPage() {
  const activities = useAppStore((s) => s.activities);
  const setActivities = useAppStore((s) => s.setActivities);
  const currentUser = useAppStore((s) => s.currentUser);

  useEffect(() => {
    if (!currentUser) return;
    apiGetActivity().then(setActivities).catch(() => {});
  }, [currentUser?.id]);

  const actMsg = (a: any) => {
    if (a.type === 'expense_created') return `Added "${a.metadata?.title}" for ${formatCurrency(a.metadata?.amount ?? 0)}`;
    if (a.type === 'settlement_recorded') return `Settled ${formatCurrency(a.metadata?.amount ?? 0)}`;
    if (a.type === 'group_created') return `Created group "${a.metadata?.name}"`;
    if (a.type === 'member_added') return `Added ${a.metadata?.memberName ?? 'a member'}`;
    if (a.type === 'expense_deleted') return `Deleted "${a.metadata?.title}"`;
    return 'Action recorded';
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold gradient-text mb-1">Activity</h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Recent activity across your groups</p>
      </motion.div>

      {activities.length === 0 ? (
        <GlassCard padding="lg" className="text-center py-16">
          <p className="text-5xl mb-4">📊</p>
          <p className="text-lg font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>No activity yet</p>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Start adding expenses to see activity here</p>
        </GlassCard>
      ) : (
        <div className="space-y-3">
          {activities.map((act: any, i: number) => (
            <motion.div key={act.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}>
              <GlassCard hover padding="sm">
                <div className="flex items-start gap-3">
                  <span className="text-2xl shrink-0">{typeIcons[act.type] ?? '📌'}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{actMsg(act)}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {act.group && <><span>{act.group.icon} {act.group.name}</span> · </>}
                      {act.actor?.name && <><span>{act.actor.name}</span> · </>}
                      {formatDate(act.createdAt)}
                    </p>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
