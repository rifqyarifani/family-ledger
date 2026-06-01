import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  formatAccountDeleteMessage,
  formatCategoryDeleteMessage,
  formatGoalDeleteMessage
} from "../lib/account-delete-utils";

describe("account delete messaging", () => {
  it("shows a permanent-remove message when there is no impact", () => {
    const result = formatAccountDeleteMessage("Cash", 0, 0, false);
    assert.equal(result.canDelete, true);
    assert.equal(result.confirmLabel, "Delete");
    assert.match(result.message, /Cash/);
    assert.match(result.message, /cannot be undone/i);
  });

  it("blocks deletion when transactions are linked", () => {
    const result = formatAccountDeleteMessage("BCA Main", 5, 0, false);
    assert.equal(result.canDelete, false);
    assert.equal(result.confirmLabel, "OK");
    assert.match(result.message, /5 linked transaction/);
    assert.match(result.message, /reassign or delete/i);
  });

  it("warns about cascading goal deletes for non-savings accounts", () => {
    const result = formatAccountDeleteMessage("Emergency", 0, 2, false);
    assert.equal(result.canDelete, true);
    assert.equal(result.confirmLabel, "Delete anyway");
    assert.match(result.message, /2 savings goals/);
    assert.match(result.message, /will also be deleted/i);
  });

  it("handles a single linked goal with singular grammar for non-savings", () => {
    const result = formatAccountDeleteMessage("Savings", 0, 1, false);
    assert.match(result.message, /1 savings goal linked/);
    assert.doesNotMatch(result.message, /1 savings goals/);
  });

  it("combines transaction and goal warnings", () => {
    const result = formatAccountDeleteMessage("Main", 3, 1, false);
    assert.equal(result.canDelete, false);
    assert.match(result.message, /3 linked transaction/);
    assert.match(result.message, /1 savings goal/);
  });

  it("falls back to a generic name when given an empty string", () => {
    const result = formatAccountDeleteMessage("", 0, 0, false);
    assert.match(result.message, /this account/);
  });

  it("allows deleting a savings account when no goals are linked", () => {
    const result = formatAccountDeleteMessage("Vacation Fund", 0, 0, true);
    assert.equal(result.canDelete, true);
    assert.equal(result.confirmLabel, "Delete");
    assert.match(result.message, /Vacation Fund/);
    assert.match(result.message, /cannot be undone/i);
  });

  it("blocks deleting a savings account with one linked goal", () => {
    const result = formatAccountDeleteMessage("Vacation Fund", 0, 1, true);
    assert.equal(result.canDelete, false);
    assert.equal(result.confirmLabel, "OK");
    assert.match(result.message, /Savings accounts track savings goals/);
    assert.match(result.message, /1 linked savings goal/);
    assert.match(result.message, /Goals page/);
  });

  it("blocks deleting a savings account with multiple linked goals using plural grammar", () => {
    const result = formatAccountDeleteMessage("Vacation Fund", 0, 3, true);
    assert.equal(result.canDelete, false);
    assert.match(result.message, /3 linked savings goals/);
    assert.match(result.message, /goals first from the Goals page/);
  });
});

describe("goal delete messaging", () => {
  it("includes the linked account name when present", () => {
    const message = formatGoalDeleteMessage("Vacation", "Emergency Fund");
    assert.match(message, /Vacation/);
    assert.match(message, /Emergency Fund/);
    assert.match(message, /cannot be undone/i);
  });

  it("omits the linked account clause when there is none", () => {
    const message = formatGoalDeleteMessage("Vacation", null);
    assert.match(message, /Vacation/);
    assert.doesNotMatch(message, /linked to/);
  });
});

describe("category delete messaging", () => {
  it("shows a permanent-remove message when there is no impact", () => {
    const result = formatCategoryDeleteMessage("Food", 0, 0);
    assert.equal(result.confirmLabel, "Delete");
    assert.match(result.message, /Food/);
    assert.match(result.message, /cannot be undone/i);
  });

  it("warns about uncategorizing transactions", () => {
    const result = formatCategoryDeleteMessage("Food", 7, 0);
    assert.match(result.message, /7 transactions will become uncategorized/);
    assert.match(result.message, /cannot be undone/i);
  });

  it("uses singular grammar for one transaction", () => {
    const result = formatCategoryDeleteMessage("Food", 1, 0);
    assert.match(result.message, /1 transaction will become uncategorized/);
  });

  it("warns about budgets losing their target", () => {
    const result = formatCategoryDeleteMessage("Food", 0, 2);
    assert.match(result.message, /2 budgets will lose their target/);
  });

  it("combines transaction and budget warnings", () => {
    const result = formatCategoryDeleteMessage("Food", 3, 1);
    assert.match(result.message, /3 transactions/);
    assert.match(result.message, /1 budget/);
  });
});
