import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  MAX_NAME_LENGTH,
  cappedName,
  composeValidators,
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
});
