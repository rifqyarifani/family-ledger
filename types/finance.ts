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

export type TransactionFormInput = Omit<Transaction, "id" | "createdAt" | "accountName" | "memberName" | "transferAccountName" | "categoryId"> & {
  categoryId?: string;
};

export type Budget = {
  id: string;
  category: string;
  limit: number;
  month: string;
};

export type BudgetFormInput = Omit<Budget, "id">;

export type FamilyMember = {
  id: string;
  name: string;
  role: string;
  email?: string;
  note?: string;
};

export type FamilyMemberFormInput = Omit<FamilyMember, "id">;

export type Account = {
  id: string;
  name: string;
  type: "cash" | "bank" | "credit" | "savings";
  openingBalance: number;
  iconColor?: string;
  ownerMemberId?: string | null;
  ownerName?: string;
};

export type AccountFormInput = Omit<Account, "id" | "ownerName"> & {
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

export type CategoryFormInput = Omit<Category, "id">;

export type SavingsGoal = {
  id: string;
  name: string;
  targetAmount: number;
  savedAmount: number;
  dueDate: string;
  accountId?: string;
};

export type SavingsGoalFormInput = Omit<SavingsGoal, "id" | "savedAmount" | "accountId"> & {
  accountId?: string;
  savedAmount?: number;
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

