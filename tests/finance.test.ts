import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  calculatePercentage,
  calculateSavingsRate,
  calculateTotalExpense,
  calculateTotalIncome,
  filterTransactionsByMonth,
  formatCurrency,
  formatDate,
  formatMonthKey,
  getCurrentMonthKey,
  getBudgetUsage,
  getMonthOptions,
  groupTransactionsByCategory,
  groupTransactionsByMember,
  groupTransactionsByMonth
} from "../lib/finance";
import type { Budget, Transaction, TransactionMonthMetric } from "../types/finance";

const transactions: Transaction[] = [
  {
    id: "income-1",
    title: "Salary",
    type: "income",
    amount: 1_000_000,
    category: "Salary",
    memberId: "member-1",
    memberName: "Alice",
    accountId: "cash",
    date: "2026-05-01",
    createdAt: "2026-05-01T00:00:00.000Z"
  },
  {
    id: "expense-1",
    title: "Groceries",
    type: "expense",
    amount: 250_000,
    category: "Food",
    memberId: "member-1",
    memberName: "Alice",
    accountId: "cash",
    date: "2026-05-03",
    createdAt: "2026-05-03T00:00:00.000Z"
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
    date: "2026-05-05",
    createdAt: "2026-05-05T00:00:00.000Z"
  },
  {
    id: "expense-2",
    title: "Book",
    type: "expense",
    amount: 100_000,
    category: "Education",
    memberId: "member-2",
    memberName: "Bob",
    accountId: "cash",
    date: "2026-04-10",
    createdAt: "2026-04-10T00:00:00.000Z"
  }
];

const metrics: TransactionMonthMetric[] = [
  { id: "m1", type: "income", amount: 1_000_000, date: "2026-05-01" },
  { id: "m2", type: "expense", amount: 250_000, date: "2026-05-03" },
  { id: "m3", type: "expense", amount: 100_000, date: "2026-04-10" }
];

describe("finance calculations", () => {
  it("calculates income, expenses, and savings rate without counting transfers as income or expense", () => {
    assert.equal(calculateTotalIncome(transactions), 1_000_000);
    assert.equal(calculateTotalExpense(transactions), 350_000);
    assert.equal(calculateSavingsRate(transactions), 65);
  });

  it("groups expense data by category and month", () => {
    assert.deepEqual(groupTransactionsByCategory(transactions), [
      { category: "Food", amount: 250_000 },
      { category: "Education", amount: 100_000 }
    ]);

    assert.deepEqual(groupTransactionsByMonth(metrics), [
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

  it("filters transactions by month", () => {
    const mayTransactions = filterTransactionsByMonth(transactions, "2026-05");
    assert.equal(mayTransactions.length, 3);
    assert.ok(mayTransactions.every((t) => t.date.startsWith("2026-05")));
  });

  it("groups transactions by member", () => {
    const byMember = groupTransactionsByMember(transactions);
    assert.equal(byMember.length, 2);
    assert.equal(byMember[0].member, "Alice");
    assert.equal(byMember[0].amount, 250_000);
    assert.equal(byMember[1].member, "Bob");
    assert.equal(byMember[1].amount, 100_000);
  });

  it("gets month options sorted descending", () => {
    const options = getMonthOptions(transactions);
    assert.ok(options.includes("2026-04"));
    assert.ok(options.includes("2026-05"));
    assert.ok(options[0] >= options[1]);
  });

  it("calculates percentage correctly", () => {
    assert.equal(calculatePercentage(50, 100), 50);
    assert.equal(calculatePercentage(1, 3), 33);
    assert.equal(calculatePercentage(0, 100), 0);
    assert.equal(calculatePercentage(50, 0), 0);
    assert.equal(calculatePercentage(50, -10), 0);
  });

  it("formats currency in IDR", () => {
    const result = formatCurrency(1000000);
    assert.ok(result.includes("Rp"));
    assert.ok(result.includes("1"));
  });

  it("formats date in Indonesian format", () => {
    const result = formatDate("2026-05-15");
    assert.ok(result.includes("Mei") || result.includes("May"));
    assert.ok(result.includes("2026"));
  });

  it("formats month key", () => {
    const result = formatMonthKey("2026-05");
    assert.ok(result.includes("Mei") || result.includes("May"));
    assert.ok(result.includes("2026"));
  });

  it("gets current month key", () => {
    const now = new Date();
    const expected = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    assert.equal(getCurrentMonthKey(), expected);
  });
});
