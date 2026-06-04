import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  calculatePercentage,
  calculateSavingsRate,
  calculateTotalExpense,
  calculateTotalIncome,
  filterTransactionsByMonth,
  formatCompactNumber,
  formatCurrency,
  formatCurrencyShort,
  formatDate,
  formatMonthKey,
  formatMonthLongYear,
  getCurrentMonthKey,
  getBudgetUsage,
  getMonthOptions,
  groupAccountsByOwner,
  groupTransactionsByCategory,
  groupTransactionsByMember,
  groupTransactionsByMonth
} from "../lib/finance";
import type { Account, Budget, FamilyMember, Transaction, TransactionMonthMetric } from "../types/finance";

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

  it("formats compact number with Indonesian abbreviations", () => {
    assert.equal(formatCompactNumber(0), "0");
    assert.equal(formatCompactNumber(250), "250");
    assert.equal(formatCompactNumber(999), "999");
    assert.equal(formatCompactNumber(1_000), "1rb");
    assert.equal(formatCompactNumber(1_500), "2rb");
    assert.equal(formatCompactNumber(1_000_000), "1jt");
    assert.equal(formatCompactNumber(1_500_000), "1.5jt");
    assert.equal(formatCompactNumber(26_500_000), "26.5jt");
    assert.equal(formatCompactNumber(10_200_000), "10.2jt");
  });

  it("formats short currency with Rp prefix", () => {
    assert.equal(formatCurrencyShort(0), "Rp 0");
    assert.equal(formatCurrencyShort(250), "Rp 250");
    assert.equal(formatCurrencyShort(1_500), "Rp 2rb");
    assert.equal(formatCurrencyShort(1_500_000), "Rp 1.5jt");
    assert.equal(formatCurrencyShort(26_500_000), "Rp 26.5jt");
  });

  it("formats month long year in Indonesian", () => {
    const result = formatMonthLongYear(new Date(2026, 4, 1));
    assert.ok(result.includes("2026"));
    assert.ok(result.includes("Mei") || result.includes("May"));
  });
});

describe("groupAccountsByOwner", () => {
  const rifqy: FamilyMember = { id: "m1", name: "Rifqy", role: "owner" };
  const ayu: FamilyMember = { id: "m2", name: "Ayu", role: "member" };
  const budi: FamilyMember = { id: "m3", name: "Budi", role: "member" };

  const joint: Account = { id: "a1", name: "Joint Bills", type: "bank", openingBalance: 0, ownerMemberId: null };
  const rifqyPersonal: Account = { id: "a2", name: "Rifqy Wallet", type: "cash", openingBalance: 0, ownerMemberId: "m1" };
  const ayuPersonal: Account = { id: "a3", name: "Ayu Wallet", type: "cash", openingBalance: 0, ownerMemberId: "m2" };
  const orphanOwner: Account = { id: "a4", name: "Legacy", type: "bank", openingBalance: 0, ownerMemberId: "m-missing" };

  it("returns empty groups for empty input", () => {
    const result = groupAccountsByOwner([], [rifqy, ayu]);
    assert.deepEqual(result.shared, []);
    assert.deepEqual(result.byMember, []);
  });

  it("groups all shared accounts when none are private", () => {
    const result = groupAccountsByOwner([joint], [rifqy, ayu]);
    assert.equal(result.shared.length, 1);
    assert.equal(result.shared[0].id, "a1");
    assert.deepEqual(result.byMember, []);
  });

  it("groups accounts by member, excluding members without accounts", () => {
    const result = groupAccountsByOwner([rifqyPersonal, ayuPersonal], [rifqy, ayu, budi]);
    assert.deepEqual(result.shared, []);
    assert.equal(result.byMember.length, 2);
    assert.equal(result.byMember[0].member.id, "m1");
    assert.equal(result.byMember[0].accounts[0].id, "a2");
    assert.equal(result.byMember[1].member.id, "m2");
    assert.equal(result.byMember[1].accounts[0].id, "a3");
  });

  it("handles a mix of shared and private", () => {
    const result = groupAccountsByOwner([joint, rifqyPersonal, ayuPersonal], [rifqy, ayu]);
    assert.equal(result.shared.length, 1);
    assert.equal(result.byMember.length, 2);
  });

  it("treats accounts whose owner is not in the member list as shared", () => {
    const result = groupAccountsByOwner([orphanOwner], [rifqy, ayu]);
    assert.equal(result.shared.length, 1);
    assert.equal(result.shared[0].id, "a4");
    assert.deepEqual(result.byMember, []);
  });
});
