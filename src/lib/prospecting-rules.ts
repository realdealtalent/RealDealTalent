// Pure functions used by the prospecting pipeline. No DB, no network —
// safe to unit-test in isolation.

export const PROSPECT_HEADCOUNT_MIN = 300;
export const PROSPECT_HEADCOUNT_MAX = 500;

export const TARGET_TITLES: string[] = [
  "VP",
  "Vice President",
  "Director",
  "Head of",
  "Chief",
  "President",
];

export function normalizeDomain(
  raw: string | null | undefined,
): string | null {
  if (!raw) return null;
  const trimmed = raw.trim().toLowerCase();
  if (!trimmed) return null;
  const stripped = trimmed
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/.*$/, "")
    .trim();
  return stripped || null;
}

export function isInProspectHeadcountWindow(
  count: number | null | undefined,
): boolean {
  if (typeof count !== "number") return false;
  return count >= PROSPECT_HEADCOUNT_MIN && count <= PROSPECT_HEADCOUNT_MAX;
}

export function industryMatches(
  actual: readonly string[] | null | undefined,
  wantedLabel: string,
  wantedTerms: readonly string[] | null | undefined,
): boolean {
  const want = [wantedLabel, ...(wantedTerms ?? [])]
    .map((s) => s.toLowerCase().trim())
    .filter(Boolean);
  if (want.length === 0) return false;

  const have = (actual ?? [])
    .map((s) => s.toLowerCase().trim())
    .filter(Boolean);
  if (have.length === 0) return false;

  return have.some((h) => want.some((w) => h.includes(w) || w.includes(h)));
}

// Returns true if any of the targets matches. Used to OR a vertical against
// each active meta — a company matches if it overlaps with the vertical OR
// with the operating context.
export type IndustryTarget = {
  label: string;
  searchTerms: readonly string[] | null | undefined;
};

export function industryMatchesAny(
  actual: readonly string[] | null | undefined,
  targets: readonly IndustryTarget[],
): boolean {
  for (const target of targets) {
    if (industryMatches(actual, target.label, target.searchTerms)) {
      return true;
    }
  }
  return false;
}

export type ContactDedupeKey = {
  fullName: string;
  normalizedName: string;
  normalizedTitle: string;
};

export function contactDedupeKey(
  firstName: string | null | undefined,
  lastName: string | null | undefined,
  title: string | null | undefined,
): ContactDedupeKey | null {
  const fullName = `${firstName ?? ""} ${lastName ?? ""}`.trim();
  const normalizedName = fullName.toLowerCase();
  const normalizedTitle = (title ?? "").trim().toLowerCase();
  if (!normalizedName || !normalizedTitle) return null;
  return { fullName, normalizedName, normalizedTitle };
}

// Detects Postgres unique-constraint violations so we can safely "insert
// or skip" without swallowing unrelated errors (network, FK violations, etc).
export function isUniqueViolation(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const e = err as { code?: unknown; cause?: { code?: unknown } };
  if (e.code === "23505") return true;
  if (e.cause && typeof e.cause === "object" && e.cause.code === "23505") {
    return true;
  }
  return false;
}
