import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { MobileApiError, parseResource } from "@/src/lib/mobile/api";

describe("mobile API resource routing", () => {
  it("accepts supported resource names", () => {
    assert.equal(parseResource("accounts"), "accounts");
    assert.equal(parseResource("budgets"), "budgets");
    assert.equal(parseResource("goals"), "goals");
    assert.equal(parseResource("categories"), "categories");
    assert.equal(parseResource("members"), "members");
  });

  it("rejects unsupported resource names", () => {
    assert.throws(
      () => parseResource("transactions"),
      (error) =>
        error instanceof MobileApiError &&
        error.status === 404 &&
        error.code === "not_found"
    );
  });
});
