'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { GlassCard, Button } from '@/components/ui';
import { useAppStore } from '@/stores/useAppStore';
import { apiGetGroups } from '@/lib/api';

export default function GroupsPage() {
  const groups = useAppStore((s) => s.groups);
  const setGroups = useAppStore((s) => s.setGroups);
  const currentUser = useAppStore((s) => s.currentUser);

  useEffect(() => {
    if (!currentUser) return;
    apiGetGroups().then(setGroups).catch(() => {});
  }, [currentUser?.id]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <h1 className="text-2xl font-bold gradient-text">Groups</h1>
        <Link href="/groups/new"><Button>+ New Group</Button></Link>
      </motion.div>

      {groups.length === 0 ? (
        <GlassCard padding="lg" className="text-center py-16">
          <p className="text-5xl mb-4">👥</p>
          <p className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>No groups yet</p>
          <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>Create your first group to start tracking expenses</p>
          <Link href="/groups/new"><Button>Create Group</Button></Link>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {groups.map((group: any, i: number) => (
            <motion.div key={group.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
              <Link href={`/groups/${group.id}`}>
                <GlassCard hover padding="md" className="h-full">
                  <div className="flex items-start gap-3 mb-4">
                    <span className="text-4xl">{group.icon}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-lg font-bold truncate" style={{ color: 'var(--text-primary)' }}>{group.name}</p>
                      <p className="text-xs capitalize truncate" style={{ color: 'var(--text-muted)' }}>{group.description || group.type}</p>
                    </div>
                  </div>
                  <div className="space-y-2 pt-3" style={{ borderTop: '1px solid var(--glass-border)' }}>
                    <div className="flex justify-between text-sm">
                      <span style={{ color: 'var(--text-secondary)' }}>Members</span>
                      <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{group.members?.length ?? 0}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span style={{ color: 'var(--text-secondary)' }}>Expenses</span>
                      <span className="font-semibold" style={{ color: 'var(--accent-cyan)' }}>{group._count?.expenses ?? 0}</span>
                    </div>
                  </div>
                </GlassCard>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
