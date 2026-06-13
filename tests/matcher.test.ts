import { describe, it, expect } from "vitest";
import { matchKeyword } from "../src/utils/matcher";

describe("matchKeyword", () => {
  describe("exact mode", () => {
    it("matches exact case-insensitive string", () => {
      const result = matchKeyword("kati ho", "kati ho", "exact");
      expect(result.matched).toBe(true);
      expect(result.layer).toBe("exact");
    });

    it("matches with different casing", () => {
      const result = matchKeyword("KATI HO", "kati ho", "exact");
      expect(result.matched).toBe(true);
      expect(result.layer).toBe("exact");
    });

    it("does not match substring", () => {
      const result = matchKeyword("kati ho price kati ho", "kati ho", "exact");
      expect(result.matched).toBe(false);
      expect(result.layer).toBeNull();
    });

    it("trims whitespace", () => {
      const result = matchKeyword("  kati ho  ", "kati ho", "exact");
      expect(result.matched).toBe(true);
    });
  });

  describe("contains mode", () => {
    it("matches substring", () => {
      const result = matchKeyword("hello shipping kati ho", "shipping", "contains");
      expect(result.matched).toBe(true);
      expect(result.layer).toBe("contains");
    });

    it("checks exact match first", () => {
      const result = matchKeyword("shipping", "shipping", "contains");
      expect(result.matched).toBe(true);
      expect(result.layer).toBe("exact");
    });

    it("does not fuzzy match", () => {
      const result = matchKeyword("shippin", "shipping", "contains");
      expect(result.matched).toBe(false);
    });
  });

  describe("all words mode", () => {
    it("matches exact first", () => {
      const result = matchKeyword("kati ho", "kati ho", "all");
      expect(result.matched).toBe(true);
      expect(result.layer).toBe("exact");
    });

    it("matches phonetic Romanized Nepali", () => {
      const result = matchKeyword("paaila parcha", "paila parcha", "all");
      expect(result.matched).toBe(true);
      expect(result.layer).toBe("phonetic");
    });

    it("matches phonetic variant 'parxa'", () => {
      const result = matchKeyword("kati parxa", "kati parcha", "all");
      expect(result.matched).toBe(true);
      expect(result.layer).toBe("phonetic");
    });

    it("matches substring via phonetic layer (includes check)", () => {
      const result = matchKeyword("hello shipping world", "shipping", "all");
      expect(result.matched).toBe(true);
      expect(result.layer).toBe("phonetic");
    });

    it("matches fuzzy (Levenshtein <= 2)", () => {
      const result = matchKeyword("shiping cost kati", "shipping", "all");
      expect(result.matched).toBe(true);
      expect(result.layer).toBe("fuzzy");
    });

    it("matches fuzzy token-level", () => {
      const result = matchKeyword("availble cha", "available cha", "all");
      expect(result.matched).toBe(true);
      expect(result.layer).toBe("fuzzy");
    });

    it("does not match when too far off", () => {
      const result = matchKeyword("xyzzy", "shipping", "all");
      expect(result.matched).toBe(false);
    });
  });

  describe("edge cases", () => {
    it("returns no match for empty keyword", () => {
      const result = matchKeyword("hello", "", "exact");
      expect(result.matched).toBe(false);
    });

    it("handles special characters", () => {
      const result = matchKeyword("kati ho?", "kati ho", "all");
      expect(result.matched).toBe(true);
    });
  });
});
