import { Router, Response } from 'express';
import { prisma } from '../index';
import { AuthRequest } from '../middleware/auth';
import { calculateUserBalance, simplifyDebts, calculateSplitAmounts } from '@dutchwise/shared';
import type { Expense, Settlement, ExpenseParticipant } from '@dutchwise/shared';

export const balanceRoutes = Router();

function toSharedExpense(e: any): Expense {
  return {
    ...e,
    date: e.date.toISOString(),
    createdAt: e.createdAt.toISOString(),
    updatedAt: e.updatedAt.toISOString(),
    deletedAt: e.deletedAt?.toISOString() ?? null,
    participants: e.participants.map((p: any): ExpenseParticipant => ({
      ...p,
    })),
  };
}

function toSharedSettlement(s: any): Settlement {
  return {
    ...s,
    date: s.date.toISOString(),
    createdAt: s.createdAt.toISOString(),
  };
}

// GET /api/balances/me — overall balance for current user
balanceRoutes.get('/me', async (req: AuthRequest, res: Response) => {
  const userGroups = await prisma.groupMember.findMany({
    where: { userId: req.userId! },
    select: { groupId: true },
  });
  const groupIds = userGroups.map((g) => g.groupId);

  const expenses = await prisma.expense.findMany({
    where: { groupId: { in: groupIds }, deletedAt: null },
    include: { participants: true },
  });

  const settlements = await prisma.settlement.findMany({
    where: { groupId: { in: groupIds } },
  });

  const result = calculateUserBalance(
    req.userId!,
    expenses.map(toSharedExpense),
    settlements.map(toSharedSettlement),
  );

  res.json({ data: result });
});

// GET /api/balances/group/:groupId — balances for a group
balanceRoutes.get('/group/:groupId', async (req: AuthRequest, res: Response) => {
  const { groupId } = req.params;

  const member = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId: req.userId! } },
  });
  if (!member) { res.status(403).json({ error: 'Not a member' }); return; }

  const members = await prisma.groupMember.findMany({
    where: { groupId },
    include: { user: true },
  });

  const expenses = await prisma.expense.findMany({
    where: { groupId, deletedAt: null },
    include: { participants: true },
  });

  const settlements = await prisma.settlement.findMany({ where: { groupId } });

  const sharedExpenses = expenses.map(toSharedExpense);
  const sharedSettlements = settlements.map(toSharedSettlement);

  const balances = members.map((m) => ({
    userId: m.userId,
    user: m.user,
    ...calculateUserBalance(m.userId, sharedExpenses, sharedSettlements),
  }));

  const allDebts = balances.flatMap((b) => b.debts);
  const simplified = simplifyDebts(allDebts);

  // Attach user info to simplified debts
  const userMap = new Map(members.map((m) => [m.userId, m.user]));
  const debtsWithUsers = simplified.map((d) => ({
    ...d,
    fromUser: userMap.get(d.from),
    toUser: userMap.get(d.to),
  }));

  res.json({ data: { balances, simplifiedDebts: debtsWithUsers } });
});
