'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { GlassCard, Button, Avatar } from '@/components/ui';
import { useAppStore } from '@/stores/useAppStore';
import { apiGetGroup, apiGetGroupBalances } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function GroupDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const groupDetail = useAppStore((s) => s.groupDetail[id]);
  const setGroupDetail = useAppStore((s) => s.setGroupDetail);
  const currentUser = useAppStore((s) => s.currentUser);

  const [balanceData, setBalanceData] = useState<any>(null);

  useEffect(() => {
    if (!currentUser) return;
    apiGetGroup(id).then((g) => setGroupDetail(id, g)).catch(() => {});
    apiGetGroupBalances(id).then(setBalanceData).catch(() => {});
  }, [currentUser?.id, id]);

  const group = groupDetail;

  if (!group) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p style={{ color: 'var(--text-muted)' }}>Loading group…</p>
      </div>
    );
  }

  const expenses = (group.expenses ?? []).filter((e: any) => !e.deletedAt);
  const totalSpent = expenses.reduce((s: number, e: any) => s + e.amount, 0);
  const simplified = balanceData?.simplifiedDebts ?? [];
  const myBalance = balanceData?.balances?.find((b: any) => b.userId === currentUser?.id);

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-4xl">{group.icon}</span>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{group.name}</h1>
            <p className="text-sm capitalize" style={{ color: 'var(--text-muted)' }}>{group.description || group.type}</p>
          </div>
        </div>
        <Link href={`/expenses/new?groupId=${id}`}><Button>+ Expense</Button></Link>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total Spent', value: formatCurrency(totalSpent), gradient: true },
          { label: 'Your Balance', value: formatCurrency(myBalance?.netBalance ?? 0), color: (myBalance?.netBalance ?? 0) >= 0 ? 'var(--green)' : 'var(--red)' },
          { label: 'Members', value: String(group.members?.length ?? 0), color: 'var(--accent-cyan)' },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 + i * 0.05 }}>
            <GlassCard padding="sm" className="text-center">
              <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>{stat.label}</p>
              <p className={`text-lg font-bold ${stat.gradient ? 'gradient-text' : ''}`} style={stat.color ? { color: stat.color } : undefined}>{stat.value}</p>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Balances */}
      {simplified.length > 0 && (
        <section>
          <h2 className="text-lg font-bold mb-3" style={{ color: 'var(--text-primary)' }}>Balances</h2>
          <GlassCard padding="md">
            <div className="space-y-2">
              {simplified.map((debt: any, i: number) => (
                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                  className="flex items-center justify-between gap-2 p-2.5 rounded-xl" style={{ background: 'var(--bg-surface)' }}>
                  <div className="flex items-center gap-2 text-sm min-w-0">
                    <Avatar name={debt.fromUser?.name ?? '?'} size="sm" />
                    <span className="font-medium truncate">{debt.fromUser?.name}</span>
                    <span style={{ color: 'var(--text-muted)' }}>→</span>
                    <Avatar name={debt.toUser?.name ?? '?'} size="sm" />
                    <span className="font-medium truncate">{debt.toUser?.name}</span>
                  </div>
                  <span className="font-bold text-sm shrink-0" style={{ color: 'var(--accent)' }}>{formatCurrency(debt.amount)}</span>
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </section>
      )}

      {/* Expenses */}
      <section>
        <h2 className="text-lg font-bold mb-3" style={{ color: 'var(--text-primary)' }}>Expenses</h2>
        {expenses.length === 0 ? (
          <GlassCard padding="lg" className="text-center py-10">
            <p className="text-4xl mb-3">💸</p>
            <p className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>No expenses yet</p>
            <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>Add your first expense</p>
            <Link href={`/expenses/new?groupId=${id}`}><Button>Add Expense</Button></Link>
          </GlassCard>
        ) : (
          <div className="space-y-3">
            {expenses.map((expense: any, i: number) => (
              <motion.div key={expense.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                <GlassCard hover padding="sm">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{expense.title}</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {formatDate(expense.date)} · {expense.paidByUser?.name ?? 'Someone'} paid · <span className="capitalize">{expense.category}</span>
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold gradient-text">{formatCurrency(expense.amount)}</p>
                      {currentUser && expense.paidByUserId === currentUser.id && (
                        <span className="text-[10px] font-semibold" style={{ color: 'var(--green)' }}>You paid</span>
                      )}
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
