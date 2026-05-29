import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  formatInputAmount,
  parseFormattedAmount,
  sanitizeFormattedAmount,
  normalizeGoalName
} from "../lib/format-utils";

describe("format-utils", () => {
  describe("formatInputAmount", () => {
    it("formats zero", () => {
      assert.equal(formatInputAmount(0), "0");
    });

    it("formats whole numbers with dot separators", () => {
      assert.equal(formatInputAmount(1000000), "1.000.000");
      assert.equal(formatInputAmount(16205000), "16.205.000");
    });

    it("formats decimals with comma separator", () => {
      assert.equal(formatInputAmount(1000.5), "1.000,5");
      assert.equal(formatInputAmount(1000.99), "1.000,99");
    });
  });

  describe("parseFormattedAmount", () => {
    it("returns NaN for empty string", () => {
      assert.ok(Number.isNaN(parseFormattedAmount("")));
      assert.ok(Number.isNaN(parseFormattedAmount("   ")));
    });

    it("parses Indonesian formatted numbers", () => {
      assert.equal(parseFormattedAmount("1.000.000"), 1000000);
      assert.equal(parseFormattedAmount("16.205.000"), 16205000);
    });

    it("parses numbers with decimal comma", () => {
      assert.equal(parseFormattedAmount("1.000,5"), 1000.5);
      assert.equal(parseFormattedAmount("1.000,99"), 1000.99);
    });

    it("parses plain numbers", () => {
      assert.equal(parseFormattedAmount("500"), 500);
      assert.equal(parseFormattedAmount("0"), 0);
    });
  });

  describe("sanitizeFormattedAmount", () => {
    it("removes non-numeric characters", () => {
      assert.equal(sanitizeFormattedAmount("abc123"), "123");
      assert.equal(sanitizeFormattedAmount("$1.000"), "1.000");
    });

    it("formats with dot separators", () => {
      assert.equal(sanitizeFormattedAmount("1000000"), "1.000.000");
      assert.equal(sanitizeFormattedAmount("1000"), "1.000");
    });

    it("handles decimal comma", () => {
      assert.equal(sanitizeFormattedAmount("1000,5"), "1.000,5");
      assert.equal(sanitizeFormattedAmount("1000,99"), "1.000,99");
    });

    it("limits decimal places to 2", () => {
      assert.equal(sanitizeFormattedAmount("1000,999"), "1.000,99");
    });

    it("returns 0 for empty input", () => {
      assert.equal(sanitizeFormattedAmount(""), "0");
    });

    it("removes leading zeros", () => {
      assert.equal(sanitizeFormattedAmount("00700"), "700");
    });
  });

  describe("normalizeGoalName", () => {
    it("trims whitespace", () => {
      assert.equal(normalizeGoalName("  Emergency Fund  "), "emergency fund");
    });

    it("converts to lowercase", () => {
      assert.equal(normalizeGoalName("EMERGENCY FUND"), "emergency fund");
    });

    it("handles empty string", () => {
      assert.equal(normalizeGoalName(""), "");
    });
  });
});
