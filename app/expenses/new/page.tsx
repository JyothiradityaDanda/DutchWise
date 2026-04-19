'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { GlassCard, Button, Input, Avatar } from '@/components/ui';
import { useAppStore } from '@/stores/useAppStore';
import { apiGetGroups, apiGetGroup, apiCreateExpense } from '@/lib/api';
import { validateSplit, EXPENSE_CATEGORIES, type SplitType } from '@/lib/constants';

export default function NewExpensePage() {
  return (
    <Suspense fallback={<div className="max-w-xl mx-auto px-4 py-16 text-center" style={{ color: 'var(--text-muted)' }}>Loading…</div>}>
      <NewExpenseForm />
    </Suspense>
  );
}

function NewExpenseForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preGroupId = searchParams.get('groupId');
  const currentUser = useAppStore((s) => s.currentUser);
  const groups = useAppStore((s) => s.groups);
  const setGroups = useAppStore((s) => s.setGroups);

  const [form, setForm] = useState({
    title: '', amount: '', groupId: preGroupId ?? '', paidBy: '',
    category: 'General', date: new Date().toISOString().split('T')[0],
    splitType: 'equal' as SplitType,
  });
  const [members, setMembers] = useState<any[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [splitVals, setSplitVals] = useState<Record<string, number>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // Load groups list
  useEffect(() => {
    if (!currentUser || groups.length > 0) return;
    apiGetGroups().then(setGroups).catch(() => {});
  }, [currentUser?.id]);

  // Load group members when group changes
  useEffect(() => {
    if (!form.groupId || !currentUser) return;
    apiGetGroup(form.groupId).then((g) => {
      const m = g.members ?? [];
      setMembers(m);
      const ids = m.map((x: any) => x.userId);
      setSelected(ids);
      const vals: Record<string, number> = {};
      ids.forEach((id: string) => { vals[id] = 1; });
      setSplitVals(vals);
      if (!form.paidBy) setForm((f) => ({ ...f, paidBy: currentUser.id }));
    }).catch(() => {});
  }, [form.groupId, currentUser?.id]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!form.title.trim()) errs.title = 'Required';
    const amt = parseFloat(form.amount);
    if (!amt || amt <= 0) errs.amount = 'Must be > 0';
    if (!form.groupId) errs.groupId = 'Pick a group';
    if (selected.length === 0) errs.participants = 'Select participants';

    if (!errs.amount && !errs.participants) {
      const pWithVals = selected.map((uid) => ({ userId: uid, shareValue: splitVals[uid] ?? 1 }));
      const v = validateSplit(amt, pWithVals, form.splitType);
      if (!v.isValid) errs.split = v.error!;
    }

    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setSubmitting(true);
    try {
      await apiCreateExpense({
        groupId: form.groupId,
        title: form.title.trim(),
        amount: amt,
        currency: 'USD',
        paidByUserId: form.paidBy || currentUser?.id,
        date: form.date,
        category: form.category,
        splitType: form.splitType,
        participants: selected.map((uid) => ({ userId: uid, shareValue: splitVals[uid] ?? 1 })),
      });
      router.push(`/groups/${form.groupId}`);
    } catch (err: any) {
      setErrors({ submit: err.message || 'Failed to add expense' });
      setSubmitting(false);
    }
  };

  const toggle = (uid: string) => {
    if (selected.includes(uid)) setSelected(selected.filter((id) => id !== uid));
    else { setSelected([...selected, uid]); setSplitVals({ ...splitVals, [uid]: 1 }); }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-6">
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-2xl font-bold gradient-text mb-1">Add Expense</h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Split a bill with your group</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
        <GlassCard padding="lg">
          <form onSubmit={submit} className="space-y-5">
            {errors.submit && <p className="text-sm p-3 rounded-xl" style={{ color: 'var(--red)', background: 'rgba(239,68,68,0.1)' }}>{errors.submit}</p>}

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Group</label>
              <select value={form.groupId} onChange={(e) => setForm({ ...form, groupId: e.target.value })} required
                className="w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                style={{ background: 'var(--bg-surface)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)' }}>
                <option value="">Select a group</option>
                {groups.map((g: any) => <option key={g.id} value={g.id}>{g.icon} {g.name}</option>)}
              </select>
              {errors.groupId && <p className="text-xs mt-1" style={{ color: 'var(--red)' }}>{errors.groupId}</p>}
            </div>

            <Input label="Description" placeholder="e.g., Dinner at restaurant" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} error={errors.title} required />
            <Input label="Amount" type="number" step="0.01" placeholder="0.00" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} error={errors.amount} required />

            {members.length > 0 && (
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Paid by</label>
                <div className="grid grid-cols-2 gap-2">
                  {members.map((m: any) => (
                    <motion.button key={m.userId} type="button" onClick={() => setForm({ ...form, paidBy: m.userId })} whileTap={{ scale: 0.97 }}
                      className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
                      style={{ background: form.paidBy === m.userId ? 'linear-gradient(135deg, var(--accent), var(--accent-pink))' : 'var(--bg-surface)', color: form.paidBy === m.userId ? '#fff' : 'var(--text-primary)' }}>
                      <Avatar name={m.user?.name ?? 'User'} src={m.user?.avatarUrl} size="sm" />
                      <span className="truncate">{m.user?.name}</span>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Category</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                  style={{ background: 'var(--bg-surface)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)' }}>
                  {EXPENSE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <Input label="Date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Split type</label>
              <div className="grid grid-cols-4 gap-2">
                {(['equal', 'exact', 'percentage', 'shares'] as SplitType[]).map((t) => (
                  <motion.button key={t} type="button" onClick={() => setForm({ ...form, splitType: t })} whileTap={{ scale: 0.95 }}
                    className="px-3 py-2 rounded-xl text-xs font-semibold capitalize transition-all"
                    style={{ background: form.splitType === t ? 'linear-gradient(135deg, var(--accent), var(--accent-pink))' : 'var(--bg-surface)', color: form.splitType === t ? '#fff' : 'var(--text-primary)' }}>
                    {t}
                  </motion.button>
                ))}
              </div>
              {errors.split && <p className="text-xs mt-1" style={{ color: 'var(--red)' }}>{errors.split}</p>}
            </div>

            {members.length > 0 && (
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Split with</label>
                <div className="space-y-1.5">
                  {members.map((m: any) => {
                    const on = selected.includes(m.userId);
                    return (
                      <div key={m.userId} className="flex items-center gap-3 p-2.5 rounded-xl transition-all"
                        style={{ background: on ? 'var(--bg-surface)' : 'transparent' }}>
                        <input type="checkbox" checked={on} onChange={() => toggle(m.userId)} className="w-4 h-4 accent-[var(--accent)] rounded" />
                        <Avatar name={m.user?.name ?? 'User'} src={m.user?.avatarUrl} size="sm" />
                        <span className="flex-1 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{m.user?.name}</span>
                        {on && form.splitType !== 'equal' && (
                          <input type="number" step="0.01" value={splitVals[m.userId] ?? 0}
                            onChange={(e) => setSplitVals({ ...splitVals, [m.userId]: parseFloat(e.target.value) || 0 })}
                            className="w-20 px-2 py-1 text-right text-sm rounded-lg focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                            style={{ background: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)' }} />
                        )}
                      </div>
                    );
                  })}
                </div>
                {errors.participants && <p className="text-xs mt-1" style={{ color: 'var(--red)' }}>{errors.participants}</p>}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="ghost" fullWidth onClick={() => router.back()}>Cancel</Button>
              <Button type="submit" fullWidth disabled={submitting}>{submitting ? 'Adding…' : 'Add Expense'}</Button>
            </div>
          </form>
        </GlassCard>
      </motion.div>
    </div>
  );
}
