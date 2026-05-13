import { describe, expect, it } from "vitest";
import {
  contactDedupeKey,
  industryMatches,
  industryMatchesAny,
  isInProspectHeadcountWindow,
  isUniqueViolation,
  normalizeDomain,
} from "@/lib/prospecting-rules";

describe("normalizeDomain", () => {
  it("returns null for null, undefined, or empty input", () => {
    expect(normalizeDomain(null)).toBeNull();
    expect(normalizeDomain(undefined)).toBeNull();
    expect(normalizeDomain("")).toBeNull();
    expect(normalizeDomain("   ")).toBeNull();
  });

  it("strips http/https protocol", () => {
    expect(normalizeDomain("https://example.com")).toBe("example.com");
    expect(normalizeDomain("http://example.com")).toBe("example.com");
  });

  it("strips www. prefix", () => {
    expect(normalizeDomain("www.example.com")).toBe("example.com");
    expect(normalizeDomain("https://www.example.com")).toBe("example.com");
  });

  it("strips path and trailing slash", () => {
    expect(normalizeDomain("example.com/")).toBe("example.com");
    expect(normalizeDomain("example.com/about")).toBe("example.com");
    expect(normalizeDomain("https://example.com/a/b?q=1")).toBe("example.com");
  });

  it("lowercases and trims whitespace", () => {
    expect(normalizeDomain("  Example.COM  ")).toBe("example.com");
  });
});

describe("isInProspectHeadcountWindow", () => {
  it("returns false for null or undefined", () => {
    expect(isInProspectHeadcountWindow(null)).toBe(false);
    expect(isInProspectHeadcountWindow(undefined)).toBe(false);
  });

  it("returns true at the lower boundary (300)", () => {
    expect(isInProspectHeadcountWindow(300)).toBe(true);
  });

  it("returns true at the upper boundary (500)", () => {
    expect(isInProspectHeadcountWindow(500)).toBe(true);
  });

  it("returns false just below the window", () => {
    expect(isInProspectHeadcountWindow(299)).toBe(false);
  });

  it("returns false just above the window", () => {
    expect(isInProspectHeadcountWindow(501)).toBe(false);
  });

  it("returns true in the middle of the window", () => {
    expect(isInProspectHeadcountWindow(400)).toBe(true);
  });
});

describe("industryMatches", () => {
  it("matches case-insensitively on exact label", () => {
    expect(industryMatches(["Manufacturing"], "manufacturing", null)).toBe(true);
    expect(industryMatches(["MANUFACTURING"], "Manufacturing", null)).toBe(true);
  });

  it("matches when wanted label is a substring of actual industry", () => {
    // Company tagged broadly; user wants a specific niche — still matches.
    expect(
      industryMatches(["Industrial Manufacturing"], "manufacturing", null),
    ).toBe(true);
  });

  it("matches when actual industry is a substring of wanted label (broader → narrower)", () => {
    // Company tagged "Manufacturing"; user wants "Industrial Manufacturing".
    // Permissive on purpose — user reviews each prospect.
    expect(
      industryMatches(["Manufacturing"], "Industrial Manufacturing", null),
    ).toBe(true);
  });

  it("returns false when there is no overlap at all", () => {
    expect(industryMatches(["Healthcare"], "Manufacturing", null)).toBe(false);
  });

  it("returns false when actual industries array is empty or null", () => {
    expect(industryMatches([], "Manufacturing", null)).toBe(false);
    expect(industryMatches(null, "Manufacturing", null)).toBe(false);
  });

  it("expands the match set via searchTerms", () => {
    expect(
      industryMatches(["CNC machining"], "Industrial", ["CNC", "fabrication"]),
    ).toBe(true);
  });

  it("trims whitespace on both sides", () => {
    expect(
      industryMatches(["  Manufacturing  "], "  manufacturing  ", null),
    ).toBe(true);
  });

  it("returns false when both label and searchTerms are empty/whitespace", () => {
    expect(industryMatches(["Manufacturing"], "", null)).toBe(false);
    expect(industryMatches(["Manufacturing"], "   ", [])).toBe(false);
  });
});

describe("industryMatchesAny", () => {
  it("returns false when targets array is empty", () => {
    expect(industryMatchesAny(["Manufacturing"], [])).toBe(false);
  });

  it("returns true when any single target matches", () => {
    expect(
      industryMatchesAny(["Oil & Gas Services"], [
        { label: "TICC Contractors", searchTerms: null },
        { label: "Oil & Gas", searchTerms: null },
      ]),
    ).toBe(true);
  });

  it("returns false when no target matches", () => {
    expect(
      industryMatchesAny(["Healthcare"], [
        { label: "TICC Contractors", searchTerms: null },
        { label: "Oil & Gas", searchTerms: null },
      ]),
    ).toBe(false);
  });

  it("considers each target's searchTerms when expanding the match", () => {
    // Company tagged with a meta-adjacent term; vertical doesn't match but
    // meta's searchTerms include "pipeline".
    expect(
      industryMatchesAny(["Pipeline Inspection"], [
        { label: "TICC Contractors", searchTerms: ["NDT"] },
        { label: "Oil & Gas", searchTerms: ["pipeline", "upstream"] },
      ]),
    ).toBe(true);
  });

  it("returns false when actual industries are empty even with non-empty targets", () => {
    expect(
      industryMatchesAny([], [
        { label: "TICC Contractors", searchTerms: null },
      ]),
    ).toBe(false);
  });
});

describe("contactDedupeKey", () => {
  it("composes fullName from first + last", () => {
    const key = contactDedupeKey("Jane", "Smith", "VP Sales");
    expect(key?.fullName).toBe("Jane Smith");
  });

  it("returns lowercased normalized name and title", () => {
    const key = contactDedupeKey("Jane", "SMITH", "VP Sales");
    expect(key?.normalizedName).toBe("jane smith");
    expect(key?.normalizedTitle).toBe("vp sales");
  });

  it("trims title whitespace", () => {
    const key = contactDedupeKey("Jane", "Smith", "  VP Sales  ");
    expect(key?.normalizedTitle).toBe("vp sales");
  });

  it("returns null when both name parts are missing", () => {
    expect(contactDedupeKey(null, null, "VP Sales")).toBeNull();
    expect(contactDedupeKey("", "", "VP Sales")).toBeNull();
  });

  it("returns null when title is missing", () => {
    expect(contactDedupeKey("Jane", "Smith", null)).toBeNull();
    expect(contactDedupeKey("Jane", "Smith", "")).toBeNull();
    expect(contactDedupeKey("Jane", "Smith", "   ")).toBeNull();
  });

  it("accepts a single name part (first or last only)", () => {
    const onlyFirst = contactDedupeKey("Jane", null, "VP Sales");
    expect(onlyFirst?.normalizedName).toBe("jane");
    const onlyLast = contactDedupeKey(null, "Smith", "VP Sales");
    expect(onlyLast?.normalizedName).toBe("smith");
  });
});

describe("isUniqueViolation", () => {
  it("returns true for a Postgres 23505 error", () => {
    expect(isUniqueViolation({ code: "23505" })).toBe(true);
  });

  it("returns true when the code is nested under cause", () => {
    expect(isUniqueViolation({ cause: { code: "23505" } })).toBe(true);
  });

  it("returns false for other Postgres error codes", () => {
    expect(isUniqueViolation({ code: "23503" })).toBe(false); // FK violation
    expect(isUniqueViolation({ code: "23502" })).toBe(false); // NOT NULL
  });

  it("returns false for non-error values", () => {
    expect(isUniqueViolation(null)).toBe(false);
    expect(isUniqueViolation(undefined)).toBe(false);
    expect(isUniqueViolation("error string")).toBe(false);
    expect(isUniqueViolation(new Error("plain"))).toBe(false);
  });
});
