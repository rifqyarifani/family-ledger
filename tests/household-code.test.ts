import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  formatHouseholdCode,
  generateHouseholdCode,
  householdCodeAlphabet,
  normalizeHouseholdCode
} from "../src/lib/household-code";

describe("household invite codes", () => {
  it("normalizes typed codes consistently", () => {
    assert.equal(normalizeHouseholdCode("fl-ab12cd"), "AB12CD");
    assert.equal(formatHouseholdCode("ab12cd"), "FL-AB12CD");
    assert.equal(formatHouseholdCode("FL AB12-CD-extra"), "FL-AB12CD");
  });

  it("generates short prefixed codes with allowed characters only", () => {
    for (let index = 0; index < 50; index += 1) {
      const generated = generateHouseholdCode();
      const normalized = normalizeHouseholdCode(generated);

      assert.match(generated, /^FL-[A-Z2-9]{6}$/);
      assert.equal(normalized.length, 6);

      for (const char of normalized) {
        assert.ok(householdCodeAlphabet.includes(char), `${char} should be in invite code alphabet`);
      }
    }
  });
});
