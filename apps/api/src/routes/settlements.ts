import { Router, Response } from 'express';
import { prisma } from '../index';
import { AuthRequest } from '../middleware/auth';

export const settlementRoutes = Router();

// GET /api/settlements?groupId=xxx
settlementRoutes.get('/', async (req: AuthRequest, res: Response) => {
  const { groupId } = req.query;
  if (!groupId) { res.status(400).json({ error: 'groupId is required' }); return; }

  const member = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId: groupId as string, userId: req.userId! } },
  });
  if (!member) { res.status(403).json({ error: 'Not a member' }); return; }

  const settlements = await prisma.settlement.findMany({
    where: { groupId: groupId as string },
    include: { payer: true, receiver: true },
    orderBy: { date: 'desc' },
  });
  res.json({ data: settlements });
});

// POST /api/settlements
settlementRoutes.post('/', async (req: AuthRequest, res: Response) => {
  const { groupId, receiverUserId, amount, currency, note } = req.body;

  if (!groupId || !receiverUserId || !amount || amount <= 0) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }

  const member = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId: req.userId! } },
  });
  if (!member) { res.status(403).json({ error: 'Not a member' }); return; }

  const settlement = await prisma.settlement.create({
    data: {
      groupId,
      payerUserId: req.userId!,
      receiverUserId,
      amount,
      currency: currency || 'USD',
      note: note?.trim() || null,
      createdByUserId: req.userId!,
    },
    include: { payer: true, receiver: true },
  });

  await prisma.activityEvent.create({
    data: {
      groupId,
      actorUserId: req.userId!,
      type: 'settlement_recorded',
      entityType: 'settlement',
      entityId: settlement.id,
      metadata: { amount: settlement.amount },
    },
  });

  res.status(201).json({ data: settlement });
});
