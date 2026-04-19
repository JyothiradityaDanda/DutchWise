export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  preferredCurrency: string;
  themePreference: 'light' | 'dark' | 'system';
  createdAt: string;
  updatedAt: string;
}

export interface Group {
  id: string;
  name: string;
  type: 'home' | 'trip' | 'couple' | 'project' | 'other';
  icon: string;
  description?: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface GroupMember {
  id: string;
  groupId: string;
  userId: string;
  user?: User;
  role: 'admin' | 'member';
  joinedAt: string;
}

export type SplitType = 'equal' | 'exact' | 'percentage' | 'shares';

export interface Expense {
  id: string;
  groupId: string;
  title: string;
  description?: string | null;
  amount: number;
  currency: string;
  paidByUserId: string;
  paidByUser?: User;
  date: string;
  category: string;
  splitType: SplitType;
  createdByUserId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  participants: ExpenseParticipant[];
}

export interface ExpenseParticipant {
  id: string;
  expenseId: string;
  userId: string;
  user?: User;
  shareType: SplitType;
  shareValue: number;
  owedAmount: number;
}

export interface Settlement {
  id: string;
  groupId: string;
  payerUserId: string;
  receiverUserId: string;
  payerUser?: User;
  receiverUser?: User;
  amount: number;
  currency: string;
  date: string;
  note?: string | null;
  createdByUserId: string;
  createdAt: string;
}

export interface ActivityEvent {
  id: string;
  groupId?: string | null;
  actorUserId: string;
  actorUser?: User;
  type: ActivityType;
  entityType: 'expense' | 'group' | 'settlement' | 'member';
  entityId: string;
  metadata: Record<string, any>;
  createdAt: string;
}

export type ActivityType =
  | 'expense_created'
  | 'expense_updated'
  | 'expense_deleted'
  | 'member_added'
  | 'settlement_recorded'
  | 'group_created';

export interface Debt {
  from: string;
  to: string;
  fromUser?: User;
  toUser?: User;
  amount: number;
}

export interface BalanceResult {
  totalOwed: number;
  totalOwing: number;
  netBalance: number;
  debts: Debt[];
}

export const EXPENSE_CATEGORIES = [
  'General', 'Food & Dining', 'Transportation', 'Entertainment',
  'Shopping', 'Housing', 'Utilities', 'Healthcare', 'Travel', 'Other',
] as const;

export type ExpenseCategory = typeof EXPENSE_CATEGORIES[number];

// API request/response types
export interface CreateGroupRequest {
  name: string;
  type: Group['type'];
  icon: string;
  description?: string;
}

export interface CreateExpenseRequest {
  groupId: string;
  title: string;
  description?: string;
  amount: number;
  currency?: string;
  paidByUserId: string;
  date: string;
  category: string;
  splitType: SplitType;
  participants: { userId: string; shareValue: number }[];
}

export interface CreateSettlementRequest {
  groupId: string;
  receiverUserId: string;
  amount: number;
  currency?: string;
  note?: string;
}

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
}
