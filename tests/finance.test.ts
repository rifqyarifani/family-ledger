import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  calculateAccountBalance,
  calculateBalance,
  calculateSavingsRate,
  calculateTotalExpense,
  calculateTotalIncome,
  getBudgetUsage,
  groupTransactionsByCategory,
  groupTransactionsByMonth
} from "../lib/finance";
import type { Account, Budget, Transaction } from "../types/finance";

const accounts: Account[] = [
  { id: "cash", name: "Cash", type: "cash", openingBalance: 100_000 },
  { id: "savings", name: "Emergency Fund", type: "savings", openingBalance: 500_000 }
];

const transactions: Transaction[] = [
  {
    id: "income-1",
    title: "Salary",
    type: "income",
    amount: 1_000_000,
    category: "Salary",
    memberId: "member-1",
    accountId: "cash",
    date: "2026-05-01"
  },
  {
    id: "expense-1",
    title: "Groceries",
    type: "expense",
    amount: 250_000,
    category: "Food",
    memberId: "member-1",
    accountId: "cash",
    date: "2026-05-03"
  },
  {
    id: "transfer-1",
    title: "Move to savings",
    type: "transfer",
    amount: 300_000,
    category: "Transfer",
    memberId: "member-1",
    accountId: "cash",
    transferAccountId: "savings",
    date: "2026-05-05"
  },
  {
    id: "expense-2",
    title: "Book",
    type: "expense",
    amount: 100_000,
    category: "Education",
    memberId: "member-1",
    accountId: "cash",
    date: "2026-04-10"
  }
];

describe("finance calculations", () => {
  it("calculates income, expenses, total balance, and savings rate without counting transfers as income or expense", () => {
    assert.equal(calculateTotalIncome(transactions), 1_000_000);
    assert.equal(calculateTotalExpense(transactions), 350_000);
    assert.equal(calculateBalance(transactions, accounts), 1_250_000);
    assert.equal(calculateSavingsRate(transactions), 65);
  });

  it("calculates account balances including transfer source and destination accounts", () => {
    assert.equal(calculateAccountBalance(accounts[0], transactions), 450_000);
    assert.equal(calculateAccountBalance(accounts[1], transactions), 800_000);
  });

  it("groups expense data by category and month", () => {
    assert.deepEqual(groupTransactionsByCategory(transactions), [
      { category: "Food", amount: 250_000 },
      { category: "Education", amount: 100_000 }
    ]);

    assert.deepEqual(groupTransactionsByMonth(transactions), [
      { month: "2026-04", income: 0, expense: 100_000, savings: -100_000 },
      { month: "2026-05", income: 1_000_000, expense: 250_000, savings: 750_000 }
    ]);
  });

  it("calculates budget usage for the budget month only", () => {
    const budget: Budget = { id: "budget-1", category: "Food", limit: 500_000, month: "2026-05" };
    assert.deepEqual(getBudgetUsage(budget, transactions), {
      spent: 250_000,
      remaining: 250_000,
      percentage: 50
    });
  });
});
