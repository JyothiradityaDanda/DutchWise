import { Router, Response } from 'express';
import { prisma } from '../index';
import { AuthRequest } from '../middleware/auth';
import { calculateSplitAmounts, validateSplit } from '@dutchwise/shared';

export const expenseRoutes = Router();

// GET /api/expenses?groupId=xxx
expenseRoutes.get('/', async (req: AuthRequest, res: Response) => {
  const { groupId } = req.query;
  if (!groupId) { res.status(400).json({ error: 'groupId is required' }); return; }

  // Verify membership
  const member = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId: groupId as string, userId: req.userId! } },
  });
  if (!member) { res.status(403).json({ error: 'Not a member' }); return; }

  const expenses = await prisma.expense.findMany({
    where: { groupId: groupId as string, deletedAt: null },
    include: { paidByUser: true, participants: { include: { user: true } } },
    orderBy: { date: 'desc' },
  });
  res.json({ data: expenses });
});

// POST /api/expenses
expenseRoutes.post('/', async (req: AuthRequest, res: Response) => {
  const { groupId, title, description, amount, currency, paidByUserId, date, category, splitType, participants } = req.body;

  if (!groupId || !title?.trim() || !amount || amount <= 0 || !participants?.length) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }

  // Verify membership
  const member = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId: req.userId! } },
  });
  if (!member) { res.status(403).json({ error: 'Not a member' }); return; }

  // Validate split
  const validation = validateSplit(amount, participants, splitType || 'equal');
  if (!validation.isValid) { res.status(400).json({ error: validation.error }); return; }

  // Calculate amounts
  const splits = calculateSplitAmounts(amount, participants, splitType || 'equal');

  const expense = await prisma.expense.create({
    data: {
      groupId,
      title: title.trim(),
      description: description?.trim() || null,
      amount,
      currency: currency || 'USD',
      paidByUserId: paidByUserId || req.userId!,
      date: new Date(date),
      category: category || 'General',
      splitType: splitType || 'equal',
      createdByUserId: req.userId!,
      participants: {
        create: splits.map((s) => {
          const orig = participants.find((p: any) => p.userId === s.userId);
          return {
            userId: s.userId,
            shareType: splitType || 'equal',
            shareValue: orig?.shareValue ?? 1,
            owedAmount: s.amount,
          };
        }),
      },
    },
    include: { paidByUser: true, participants: { include: { user: true } } },
  });

  await prisma.activityEvent.create({
    data: {
      groupId,
      actorUserId: req.userId!,
      type: 'expense_created',
      entityType: 'expense',
      entityId: expense.id,
      metadata: { title: expense.title, amount: expense.amount },
    },
  });

  res.status(201).json({ data: expense });
});

// PATCH /api/expenses/:id
expenseRoutes.patch('/:id', async (req: AuthRequest, res: Response) => {
  const expense = await prisma.expense.findUnique({
    where: { id: req.params.id },
    include: { group: { include: { members: true } } },
  });
  if (!expense) { res.status(404).json({ error: 'Not found' }); return; }

  const isMember = expense.group.members.some((m) => m.userId === req.userId);
  if (!isMember) { res.status(403).json({ error: 'Not a member' }); return; }

  const { title, description, amount, category, date } = req.body;
  const updated = await prisma.expense.update({
    where: { id: req.params.id },
    data: { title, description, amount, category, date: date ? new Date(date) : undefined },
    include: { paidByUser: true, participants: { include: { user: true } } },
  });
  res.json({ data: updated });
});

// DELETE /api/expenses/:id — soft delete
expenseRoutes.delete('/:id', async (req: AuthRequest, res: Response) => {
  const expense = await prisma.expense.findUnique({
    where: { id: req.params.id },
    include: { group: { include: { members: true } } },
  });
  if (!expense) { res.status(404).json({ error: 'Not found' }); return; }

  const isMember = expense.group.members.some((m) => m.userId === req.userId);
  if (!isMember) { res.status(403).json({ error: 'Not a member' }); return; }

  await prisma.expense.update({ where: { id: req.params.id }, data: { deletedAt: new Date() } });

  await prisma.activityEvent.create({
    data: {
      groupId: expense.groupId,
      actorUserId: req.userId!,
      type: 'expense_deleted',
      entityType: 'expense',
      entityId: expense.id,
      metadata: { title: expense.title, amount: expense.amount },
    },
  });

  res.json({ data: { success: true } });
});
