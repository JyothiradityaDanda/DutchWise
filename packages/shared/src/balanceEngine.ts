import type { Expense, Settlement, Debt, BalanceResult } from './types';

export function calculateUserBalance(
  userId: string,
  expenses: Expense[],
  settlements: Settlement[],
): BalanceResult {
  let totalOwed = 0;
  let totalOwing = 0;
  const debtMap = new Map<string, number>();

  for (const expense of expenses) {
    if (expense.deletedAt) continue;
    const participant = expense.participants.find((p) => p.userId === userId);
    if (!participant) continue;

    if (expense.paidByUserId === userId) {
      totalOwed += expense.amount - participant.owedAmount;
      for (const p of expense.participants) {
        if (p.userId !== userId) {
          debtMap.set(p.userId, (debtMap.get(p.userId) ?? 0) - p.owedAmount);
        }
      }
    } else {
      totalOwing += participant.owedAmount;
      debtMap.set(expense.paidByUserId, (debtMap.get(expense.paidByUserId) ?? 0) + participant.owedAmount);
    }
  }

  for (const s of settlements) {
    if (s.payerUserId === userId) {
      totalOwing -= s.amount;
      debtMap.set(s.receiverUserId, (debtMap.get(s.receiverUserId) ?? 0) - s.amount);
    } else if (s.receiverUserId === userId) {
      totalOwed -= s.amount;
      debtMap.set(s.payerUserId, (debtMap.get(s.payerUserId) ?? 0) + s.amount);
    }
  }

  const debts: Debt[] = [];
  debtMap.forEach((amount, otherUserId) => {
    if (Math.abs(amount) < 0.01) return;
    debts.push(
      amount > 0
        ? { from: otherUserId, to: userId, amount: Math.abs(amount) }
        : { from: userId, to: otherUserId, amount: Math.abs(amount) },
    );
  });

  return { totalOwed, totalOwing, netBalance: totalOwed - totalOwing, debts };
}

export function simplifyDebts(debts: Debt[]): Debt[] {
  const balances = new Map<string, number>();
  for (const d of debts) {
    balances.set(d.from, (balances.get(d.from) ?? 0) - d.amount);
    balances.set(d.to, (balances.get(d.to) ?? 0) + d.amount);
  }

  const creditors: { userId: string; amount: number }[] = [];
  const debtors: { userId: string; amount: number }[] = [];
  balances.forEach((amt, uid) => {
    if (amt > 0.01) creditors.push({ userId: uid, amount: amt });
    else if (amt < -0.01) debtors.push({ userId: uid, amount: Math.abs(amt) });
  });

  creditors.sort((a, b) => b.amount - a.amount);
  debtors.sort((a, b) => b.amount - a.amount);

  const result: Debt[] = [];
  let ci = 0, di = 0;
  while (ci < creditors.length && di < debtors.length) {
    const amt = Math.min(creditors[ci].amount, debtors[di].amount);
    if (amt > 0.01) result.push({ from: debtors[di].userId, to: creditors[ci].userId, amount: amt });
    creditors[ci].amount -= amt;
    debtors[di].amount -= amt;
    if (creditors[ci].amount < 0.01) ci++;
    if (debtors[di].amount < 0.01) di++;
  }

  return result;
}

export function calculateSplitAmounts(
  totalAmount: number,
  participants: { userId: string; shareValue: number }[],
  splitType: 'equal' | 'exact' | 'percentage' | 'shares',
): { userId: string; amount: number }[] {
  switch (splitType) {
    case 'equal':
      return participants.map((p) => ({ userId: p.userId, amount: totalAmount / participants.length }));
    case 'exact':
      return participants.map((p) => ({ userId: p.userId, amount: p.shareValue }));
    case 'percentage':
      return participants.map((p) => ({ userId: p.userId, amount: (totalAmount * p.shareValue) / 100 }));
    case 'shares': {
      const total = participants.reduce((s, p) => s + p.shareValue, 0);
      return participants.map((p) => ({ userId: p.userId, amount: (totalAmount * p.shareValue) / total }));
    }
  }
}

export function validateSplit(
  totalAmount: number,
  participants: { userId: string; shareValue: number }[],
  splitType: 'equal' | 'exact' | 'percentage' | 'shares',
): { isValid: boolean; error?: string } {
  if (participants.length === 0) return { isValid: false, error: 'At least one participant is required' };
  if (totalAmount <= 0) return { isValid: false, error: 'Amount must be greater than 0' };

  if (splitType === 'exact') {
    const sum = participants.reduce((s, p) => s + p.shareValue, 0);
    if (Math.abs(sum - totalAmount) > 0.01) return { isValid: false, error: `Amounts (${sum.toFixed(2)}) must equal total (${totalAmount.toFixed(2)})` };
  } else if (splitType === 'percentage') {
    const sum = participants.reduce((s, p) => s + p.shareValue, 0);
    if (Math.abs(sum - 100) > 0.01) return { isValid: false, error: 'Percentages must add up to 100%' };
  } else if (splitType === 'shares') {
    if (participants.reduce((s, p) => s + p.shareValue, 0) === 0) return { isValid: false, error: 'Total shares must be > 0' };
  }

  return { isValid: true };
}
