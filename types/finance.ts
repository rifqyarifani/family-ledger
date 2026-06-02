export type TransactionType = "income" | "expense" | "transfer";

export type Transaction = {
  id: string;
  title: string;
  type: TransactionType;
  amount: number;
  category: string;
  categoryId?: string;
  memberId: string;
  memberName?: string;
  accountId: string;
  accountName?: string;
  transferAccountId?: string;
  transferAccountName?: string;
  date: string;
  time?: string;
  createdAt: string;
  note?: string;
};

export type Budget = {
  id: string;
  category: string;
  limit: number;
  month: string;
};

export type FamilyMember = {
  id: string;
  name: string;
  role: string;
  email?: string;
  note?: string;
};

export type Account = {
  id: string;
  name: string;
  type: "cash" | "bank" | "credit" | "savings";
  openingBalance: number;
  iconColor?: string;
  ownerMemberId?: string | null;
  ownerName?: string;
};

export type AccountBalanceMap = Record<string, number>;

export type FamilyMemberTransactionTotals = Record<
  string,
  {
    income: number;
    expense: number;
  }
>;

export type TransactionMonthMetric = Pick<Transaction, "id" | "type" | "amount" | "date">;

export type Category = {
  id: string;
  name: string;
  type: TransactionType;
  color?: string;
  icon?: string;
};

export type SavingsGoal = {
  id: string;
  name: string;
  targetAmount: number;
  savedAmount: number;
  dueDate: string;
  accountId?: string;
};

export type SavingsGoalAccountOption = {
  name: string;
  savedAmount: number;
};

export type Settings = {
  householdName: string;
  profileFirstName: string;
  profileLastName: string;
  profileEmail: string;
  profilePlan: "Family" | "Premium";
  currency: "IDR";
  monthlyCycleDay: number;
  themePreference: "system" | "light";
};

export type UserProfile = {
  id: string;
  email: string | null;
  firstName: string;
  lastName: string;
  displayName: string;
} | null;

