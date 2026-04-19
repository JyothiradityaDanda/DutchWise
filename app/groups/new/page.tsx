'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { GlassCard, Button, Input } from '@/components/ui';
import { apiCreateGroup } from '@/lib/api';

const GROUP_TYPES = ['home', 'trip', 'couple', 'project', 'other'] as const;
const GROUP_ICONS = ['🏠', '🏖️', '❤️', '💼', '🎉', '🍽️', '✈️', '🎮', '🏃', '📚'];

export default function NewGroupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', type: 'other' as string, icon: '🎉', description: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Group name is required'); return; }
    setSubmitting(true);
    setError('');

    try {
      const group = await apiCreateGroup(form);
      router.push(`/groups/${group.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create group');
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-6">
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-2xl font-bold gradient-text mb-1">Create New Group</h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Start tracking expenses with friends</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
        <GlassCard padding="lg">
          <form onSubmit={submit} className="space-y-5">
            <Input label="Group Name" placeholder="e.g., Weekend Trip" value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })} error={error && !form.name.trim() ? error : undefined} required />

            {error && form.name.trim() && <p className="text-sm" style={{ color: 'var(--red)' }}>{error}</p>}

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Icon</label>
              <div className="grid grid-cols-5 gap-2">
                {GROUP_ICONS.map((icon) => (
                  <motion.button key={icon} type="button" onClick={() => setForm({ ...form, icon })} whileTap={{ scale: 0.9 }}
                    className="text-3xl p-3 rounded-xl transition-all"
                    style={{ background: form.icon === icon ? 'var(--bg-surface)' : 'transparent', border: form.icon === icon ? '2px solid var(--accent)' : '2px solid transparent' }}>
                    {icon}
                  </motion.button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Type</label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {GROUP_TYPES.map((t) => (
                  <motion.button key={t} type="button" onClick={() => setForm({ ...form, type: t })} whileTap={{ scale: 0.95 }}
                    className="px-3 py-2 rounded-xl text-sm font-medium capitalize transition-all"
                    style={{ background: form.type === t ? 'linear-gradient(135deg, var(--accent), var(--accent-pink))' : 'var(--bg-surface)', color: form.type === t ? '#fff' : 'var(--text-primary)' }}>
                    {t}
                  </motion.button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Description (optional)</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2}
                className="w-full rounded-xl px-4 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                style={{ background: 'var(--bg-surface)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)' }}
                placeholder="Add a note…" />
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="ghost" fullWidth onClick={() => router.back()}>Cancel</Button>
              <Button type="submit" fullWidth disabled={submitting}>{submitting ? 'Creating…' : 'Create Group'}</Button>
            </div>
          </form>
        </GlassCard>
      </motion.div>
    </div>
  );
}
