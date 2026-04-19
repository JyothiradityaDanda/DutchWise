export type SplitType = 'equal' | 'exact' | 'percentage' | 'shares';

export const EXPENSE_CATEGORIES = [
  'General', 'Food & Dining', 'Transportation', 'Entertainment',
  'Shopping', 'Housing', 'Utilities', 'Healthcare', 'Travel', 'Other',
] as const;

export function validateSplit(
  totalAmount: number,
  participants: { userId: string; shareValue: number }[],
  splitType: SplitType,
): { isValid: boolean; error?: string } {
  if (participants.length === 0) return { isValid: false, error: 'At least one participant is required' };
  if (totalAmount <= 0) return { isValid: false, error: 'Amount must be greater than 0' };

  if (splitType === 'exact') {
    const sum = participants.reduce((s, p) => s + p.shareValue, 0);
    if (Math.abs(sum - totalAmount) > 0.01)
      return { isValid: false, error: `Amounts (${sum.toFixed(2)}) must equal total (${totalAmount.toFixed(2)})` };
  } else if (splitType === 'percentage') {
    const sum = participants.reduce((s, p) => s + p.shareValue, 0);
    if (Math.abs(sum - 100) > 0.01) return { isValid: false, error: 'Percentages must add up to 100%' };
  } else if (splitType === 'shares') {
    if (participants.reduce((s, p) => s + p.shareValue, 0) === 0) return { isValid: false, error: 'Total shares must be > 0' };
  }

  return { isValid: true };
}
