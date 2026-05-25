import type { Account, Budget, Transaction } from "@/types/finance";

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  }).format(amount);
}

export function formatDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  const date = year && month && day ? new Date(year, month - 1, day) : new Date(value);

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(date);
}

export function getCurrentMonthKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export function formatMonthKey(value: string) {
  const [year, month] = value.split("-").map(Number);
  const date = year && month ? new Date(year, month - 1, 1) : new Date(value);

  return new Intl.DateTimeFormat("id-ID", {
    month: "short",
    year: "numeric"
  }).format(date);
}

export function getTransactionMonth(transaction: Transaction) {
  return transaction.date.slice(0, 7);
}

export function filterTransactionsByMonth(transactions: Transaction[], month: string) {
  return transactions.filter((transaction) => getTransactionMonth(transaction) === month);
}

export function calculateTotalIncome(transactions: Transaction[]) {
  return transactions
    .filter((transaction) => transaction.type === "income")
    .reduce((total, transaction) => total + transaction.amount, 0);
}

export function calculateTotalExpense(transactions: Transaction[]) {
  return transactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((total, transaction) => total + transaction.amount, 0);
}

export function calculateBalance(transactions: Transaction[], accounts: Account[] = []) {
  const openingBalance = accounts.reduce((total, account) => total + account.openingBalance, 0);
  return openingBalance + calculateTotalIncome(transactions) - calculateTotalExpense(transactions);
}

export function calculateSavingsRate(transactions: Transaction[]) {
  const income = calculateTotalIncome(transactions);
  const expense = calculateTotalExpense(transactions);

  if (income === 0) {
    return 0;
  }

  return Math.max(0, Math.round(((income - expense) / income) * 100));
}

export function groupTransactionsByCategory(transactions: Transaction[]) {
  const grouped = new Map<string, number>();

  transactions
    .filter((transaction) => transaction.type === "expense")
    .forEach((transaction) => {
      grouped.set(transaction.category, (grouped.get(transaction.category) ?? 0) + transaction.amount);
    });

  return Array.from(grouped, ([category, amount]) => ({ category, amount })).sort(
    (a, b) => b.amount - a.amount
  );
}

export function groupTransactionsByMember(transactions: Transaction[]) {
  const grouped = new Map<string, number>();

  transactions
    .filter((transaction) => transaction.type === "expense")
    .forEach((transaction) => {
      const member = transaction.memberName ?? "Unknown";
      grouped.set(member, (grouped.get(member) ?? 0) + transaction.amount);
    });

  return Array.from(grouped, ([member, amount]) => ({ member, amount })).sort(
    (a, b) => b.amount - a.amount
  );
}

export function groupTransactionsByMonth(transactions: Transaction[]) {
  const grouped = new Map<string, { month: string; income: number; expense: number; savings: number }>();

  transactions.forEach((transaction) => {
    const month = getTransactionMonth(transaction);
    const current = grouped.get(month) ?? { month, income: 0, expense: 0, savings: 0 };

    if (transaction.type === "income") {
      current.income += transaction.amount;
    } else if (transaction.type === "expense") {
      current.expense += transaction.amount;
    }

    current.savings = current.income - current.expense;
    grouped.set(month, current);
  });

  return Array.from(grouped.values()).sort((a, b) => a.month.localeCompare(b.month));
}

export function getBudgetUsage(budget: Budget, transactions: Transaction[]) {
  const spent = transactions
    .filter(
      (transaction) =>
        transaction.type === "expense" &&
        transaction.category === budget.category &&
        getTransactionMonth(transaction) === budget.month
    )
    .reduce((total, transaction) => total + transaction.amount, 0);

  const remaining = budget.limit - spent;
  const percentage = budget.limit > 0 ? Math.round((spent / budget.limit) * 100) : 0;

  return { spent, remaining, percentage };
}

export function calculateAccountBalance(account: Account, transactions: Transaction[]) {
  return transactions.reduce((balance, transaction) => {
    if (transaction.type === "income" && transaction.accountId === account.id) {
      return balance + transaction.amount;
    }

    if (transaction.type === "expense" && transaction.accountId === account.id) {
      return balance - transaction.amount;
    }

    if (transaction.type === "transfer") {
      if (transaction.accountId === account.id) {
        return balance - transaction.amount;
      }

      if (transaction.transferAccountId === account.id) {
        return balance + transaction.amount;
      }
    }

    return balance;
  }, account.openingBalance);
}

export function getMonthOptions(transactions: Transaction[]) {
  const months = new Set(transactions.map(getTransactionMonth));
  months.add(getCurrentMonthKey());
  return Array.from(months).sort((a, b) => b.localeCompare(a));
}

export function calculatePercentage(value: number, total: number) {
  if (total <= 0) {
    return 0;
  }

  return Math.round((value / total) * 100);
}
