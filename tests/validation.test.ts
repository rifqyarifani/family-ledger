import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  MAX_NAME_LENGTH,
  cappedName,
  composeValidators,
  isValidISODate,
  isValidMonthKey,
  isValidTime,
  isValidUuid,
  maxLength,
  mustSelect,
  nonNegativeAmount,
  positiveAmount,
  requiredString
} from "../lib/validation";

const parseAmount = (value: string) => {
  if (!value.trim()) {
    return Number.NaN;
  }
  return Number(value.replace(/\./g, "").replace(",", "."));
};

describe("validation", () => {
  describe("MAX_NAME_LENGTH", () => {
    it("is 30", () => {
      assert.equal(MAX_NAME_LENGTH, 30);
    });
  });

  describe("requiredString", () => {
    it("rejects empty", () => {
      assert.equal(requiredString(""), "This field is required.");
      assert.equal(requiredString("   "), "This field is required.");
    });

    it("accepts non-empty", () => {
      assert.equal(requiredString("hello"), null);
    });

    it("uses provided label", () => {
      assert.equal(requiredString("", "Name"), "Name is required.");
    });
  });

  describe("maxLength", () => {
    it("accepts under limit", () => {
      assert.equal(maxLength("abc", 5, "Name"), null);
    });

    it("accepts exactly at limit", () => {
      assert.equal(maxLength("abcde", 5, "Name"), null);
    });

    it("rejects over limit", () => {
      assert.equal(
        maxLength("abcdef", 5, "Name"),
        "Name must be 5 characters or fewer."
      );
    });
  });

  describe("cappedName", () => {
    it("rejects empty", () => {
      assert.equal(cappedName(""), "Name is required.");
    });

    it("accepts within MAX_NAME_LENGTH", () => {
      assert.equal(cappedName("Family"), null);
    });

    it("rejects over MAX_NAME_LENGTH", () => {
      const tooLong = "x".repeat(MAX_NAME_LENGTH + 1);
      assert.equal(
        cappedName(tooLong),
        `Name must be ${MAX_NAME_LENGTH} characters or fewer.`
      );
    });
  });

  describe("positiveAmount", () => {
    it("rejects empty", () => {
      assert.equal(positiveAmount("", parseAmount), "Amount is required.");
    });

    it("rejects zero", () => {
      assert.equal(
        positiveAmount("0", parseAmount),
        "Amount must be a positive number."
      );
    });

    it("rejects negative", () => {
      assert.equal(
        positiveAmount("-100", parseAmount),
        "Amount must be a positive number."
      );
    });

    it("rejects non-numeric", () => {
      assert.equal(
        positiveAmount("abc", parseAmount),
        "Amount must be a positive number."
      );
    });

    it("accepts positive", () => {
      assert.equal(positiveAmount("1000", parseAmount), null);
      assert.equal(positiveAmount("1.000,5", parseAmount), null);
    });
  });

  describe("nonNegativeAmount", () => {
    it("rejects negative", () => {
      assert.equal(
        nonNegativeAmount("-100", parseAmount),
        "Amount must be zero or a positive number."
      );
    });

    it("accepts zero", () => {
      assert.equal(nonNegativeAmount("0", parseAmount), null);
    });

    it("accepts positive", () => {
      assert.equal(nonNegativeAmount("5000", parseAmount), null);
    });
  });

  describe("mustSelect", () => {
    it("rejects empty", () => {
      assert.equal(mustSelect("", "Account"), "Choose account.");
    });

    it("accepts non-empty", () => {
      assert.equal(mustSelect("acct-1", "Account"), null);
    });
  });

  describe("composeValidators", () => {
    it("returns first error", () => {
      const result = composeValidators(null, "boom", null);
      assert.equal(result, "boom");
    });

    it("returns null when all pass", () => {
      const result = composeValidators(null, null, null);
      assert.equal(result, null);
    });

    it("returns null when no validators", () => {
      const result = composeValidators();
      assert.equal(result, null);
    });
  });

  describe("isValidISODate", () => {
    it("accepts a real date", () => {
      assert.equal(isValidISODate("2026-06-04"), true);
    });

    it("rejects bad format", () => {
      assert.equal(isValidISODate("2026/06/04"), false);
      assert.equal(isValidISODate("04-06-2026"), false);
      assert.equal(isValidISODate("not-a-date"), false);
      assert.equal(isValidISODate(""), false);
    });

    it("rejects impossible dates", () => {
      assert.equal(isValidISODate("2026-02-30"), false);
      assert.equal(isValidISODate("2026-13-01"), false);
      assert.equal(isValidISODate("2026-00-10"), false);
      assert.equal(isValidISODate("2026-04-31"), false);
    });

    it("accepts leap day in leap year", () => {
      assert.equal(isValidISODate("2024-02-29"), true);
    });

    it("rejects leap day in non-leap year", () => {
      assert.equal(isValidISODate("2025-02-29"), false);
    });
  });

  describe("isValidTime", () => {
    it("accepts HH:MM", () => {
      assert.equal(isValidTime("09:30"), true);
      assert.equal(isValidTime("00:00"), true);
      assert.equal(isValidTime("23:59"), true);
    });

    it("accepts HH:MM:SS", () => {
      assert.equal(isValidTime("09:30:45"), true);
    });

    it("rejects bad format", () => {
      assert.equal(isValidTime("9:30"), false);
      assert.equal(isValidTime("09-30"), false);
      assert.equal(isValidTime(""), false);
    });

    it("rejects out of range", () => {
      assert.equal(isValidTime("24:00"), false);
      assert.equal(isValidTime("12:60"), false);
    });
  });

  describe("isValidMonthKey", () => {
    it("accepts YYYY-MM with month 1-12", () => {
      assert.equal(isValidMonthKey("2026-01"), true);
      assert.equal(isValidMonthKey("2026-12"), true);
    });

    it("rejects bad month", () => {
      assert.equal(isValidMonthKey("2026-00"), false);
      assert.equal(isValidMonthKey("2026-13"), false);
    });

    it("rejects bad format", () => {
      assert.equal(isValidMonthKey("2026/01"), false);
      assert.equal(isValidMonthKey("01-2026"), false);
      assert.equal(isValidMonthKey("2026-1"), false);
    });
  });

  describe("isValidUuid", () => {
    it("accepts a real uuid", () => {
      assert.equal(isValidUuid("a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d"), true);
    });

    it("is case-insensitive", () => {
      assert.equal(isValidUuid("A1B2C3D4-E5F6-4A7B-8C9D-0E1F2A3B4C5D"), true);
    });

    it("rejects malformed values", () => {
      assert.equal(isValidUuid("not-a-uuid"), false);
      assert.equal(isValidUuid(""), false);
      assert.equal(isValidUuid("a1b2c3d4e5f64a7b8c9d0e1f2a3b4c5d"), false);
    });
  });
});
