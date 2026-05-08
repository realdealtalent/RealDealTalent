import { db } from "@/db";
import {
  companies,
  companySignals,
  filterConfig,
  scoringConfig,
  stageHistory,
} from "@/db/schema";
import type { Company, CompanySignal, SignalType } from "@/db/schema";
import { eq } from "drizzle-orm";

export type SignalInput = {
  signalType: SignalType;
  value?: unknown;
  source?: string;
  observedAt?: Date;
};

export type ScoreBreakdown = {
  signals: Array<{
    id: string;
    signalType: string;
    weight: number;
    points: number;
    source: string | null;
    observedAt: string;
    value: unknown;
  }>;
  totalScore: number;
  threshold: number;
  filtersPass: boolean;
  filterResults: {
    headcount: { pass: boolean; value: number | null; min: number; max: number };
    geography: { pass: boolean; value: string | null; allowed: string[] };
  };
  meetsThreshold: boolean;
  qualifies: boolean;
};

// --- Pure functions (no DB) ---

export function checkHardFilters(
  company: { employeeCount: number | null; hqCountry: string | null },
  filters: { headcount_min: number; headcount_max: number; geography: string[] },
): { pass: boolean; headcount: { pass: boolean }; geography: { pass: boolean } } {
  const headcountPass =
    company.employeeCount != null &&
    company.employeeCount >= filters.headcount_min &&
    company.employeeCount <= filters.headcount_max;

  const geographyPass =
    company.hqCountry != null &&
    filters.geography.includes(company.hqCountry.toUpperCase());

  return {
    pass: headcountPass && geographyPass,
    headcount: { pass: headcountPass },
    geography: { pass: geographyPass },
  };
}

export function computeScore(
  signals: Array<{ signalType: string; weightAtObservation: number }>,
  weights: Record<string, number>,
): { total: number; perSignal: Array<{ signalType: string; points: number }> } {
  const perSignal: Array<{ signalType: string; points: number }> = [];
  let total = 0;

  for (const signal of signals) {
    const weight = weights[signal.signalType] ?? 0;
    const points = weight;
    perSignal.push({ signalType: signal.signalType, points });
    total += points;
  }

  return { total, perSignal };
}

// --- DB functions ---

export async function getFilterConfig() {
  const [config] = await db.select().from(filterConfig).limit(1);
  return config?.filters ?? { headcount_min: 25, headcount_max: 300, geography: ["US", "CA"] };
}

export async function getScoringConfig() {
  const [config] = await db.select().from(scoringConfig).limit(1);
  return {
    weights: config?.weights ?? {
      open_sales_role: 25,
      open_ops_role: 20,
      event_exhibitor: 15,
      recent_funding: 15,
      leadership_change: 15,
      pe_owned: 10,
      multi_site_expansion: 10,
      certification_added: 10,
    },
    threshold: config?.threshold ?? 50,
  };
}

export async function addSignal(
  companyId: string,
  input: SignalInput,
): Promise<{ ok: true; signal: CompanySignal; company: Company } | { ok: false; error: string }> {
  // Fetch company
  const [company] = await db
    .select()
    .from(companies)
    .where(eq(companies.id, companyId))
    .limit(1);

  if (!company) {
    return { ok: false, error: "Company not found" };
  }

  // Get current weight for this signal type
  const { weights } = await getScoringConfig();
  const weight = weights[input.signalType] ?? 0;

  // Insert signal (append-only)
  const [signal] = await db
    .insert(companySignals)
    .values({
      companyId,
      signalType: input.signalType,
      value: input.value ?? null,
      source: input.source ?? null,
      observedAt: input.observedAt ?? new Date(),
      weightAtObservation: weight,
    })
    .returning();

  // Evaluate qualification
  const updated = await evaluateQualification(companyId);

  return { ok: true, signal, company: updated };
}

export async function evaluateQualification(companyId: string): Promise<Company> {
  const [company] = await db
    .select()
    .from(companies)
    .where(eq(companies.id, companyId))
    .limit(1);

  if (!company) throw new Error("Company not found");

  const filters = await getFilterConfig();
  const { weights, threshold } = await getScoringConfig();

  // Get all signals for this company
  const signals = await db
    .select()
    .from(companySignals)
    .where(eq(companySignals.companyId, companyId));

  // Compute score using current weights (not weight_at_observation — that's for audit)
  const { total } = computeScore(
    signals.map((s) => ({ signalType: s.signalType, weightAtObservation: s.weightAtObservation })),
    weights,
  );

  const filterResult = checkHardFilters(
    { employeeCount: company.employeeCount, hqCountry: company.hqCountry },
    filters,
  );

  const qualifies = filterResult.pass && total >= threshold;
  const now = new Date();

  // Determine if status should auto-advance
  const shouldAdvance =
    company.status === "prospect" && qualifies;

  const updates: Record<string, unknown> = {
    currentScore: total,
    updatedAt: now,
  };

  if (shouldAdvance) {
    updates.status = "qualified";
    updates.statusChangedAt = now;
  }

  const [updated] = await db
    .update(companies)
    .set(updates)
    .where(eq(companies.id, companyId))
    .returning();

  // Record stage history if status changed
  if (shouldAdvance) {
    await db.insert(stageHistory).values({
      entityType: "company",
      entityId: companyId,
      fromStage: company.status,
      toStage: "qualified",
      changedAt: now,
      changedBy: "system:auto-qualification",
      note: `Auto-qualified: score ${total} >= threshold ${threshold}, filters passed`,
    });
  }

  return updated;
}

export async function recomputeAllScores(): Promise<{
  total: number;
  advanced: number;
  reverted: number;
}> {
  const filters = await getFilterConfig();
  const { weights, threshold } = await getScoringConfig();

  const allCompanies = await db.select().from(companies);
  const allSignals = await db.select().from(companySignals);

  // Group signals by company
  const signalsByCompany = new Map<string, typeof allSignals>();
  for (const signal of allSignals) {
    const arr = signalsByCompany.get(signal.companyId) ?? [];
    arr.push(signal);
    signalsByCompany.set(signal.companyId, arr);
  }

  let advanced = 0;
  let reverted = 0;
  const now = new Date();

  for (const company of allCompanies) {
    const signals = signalsByCompany.get(company.id) ?? [];
    const { total } = computeScore(
      signals.map((s) => ({ signalType: s.signalType, weightAtObservation: s.weightAtObservation })),
      weights,
    );

    const filterResult = checkHardFilters(
      { employeeCount: company.employeeCount, hqCountry: company.hqCountry },
      filters,
    );

    const qualifies = filterResult.pass && total >= threshold;
    const updates: Record<string, unknown> = {
      currentScore: total,
      updatedAt: now,
    };

    let newStatus: string | null = null;

    // prospect -> qualified if now qualifies
    if (company.status === "prospect" && qualifies) {
      newStatus = "qualified";
      advanced++;
    }
    // qualified -> prospect if no longer qualifies
    else if (company.status === "qualified" && !qualifies) {
      newStatus = "prospect";
      reverted++;
    }

    if (newStatus) {
      updates.status = newStatus;
      updates.statusChangedAt = now;
    }

    await db
      .update(companies)
      .set(updates)
      .where(eq(companies.id, company.id));

    if (newStatus) {
      await db.insert(stageHistory).values({
        entityType: "company",
        entityId: company.id,
        fromStage: company.status,
        toStage: newStatus,
        changedAt: now,
        changedBy: "system:config-recompute",
        note: `Config changed: score ${total}, threshold ${threshold}, filters ${filterResult.pass ? "pass" : "fail"}`,
      });
    }
  }

  return { total: allCompanies.length, advanced, reverted };
}

export async function getScoreBreakdown(companyId: string): Promise<ScoreBreakdown> {
  const [company] = await db
    .select()
    .from(companies)
    .where(eq(companies.id, companyId))
    .limit(1);

  if (!company) throw new Error("Company not found");

  const filters = await getFilterConfig();
  const { weights, threshold } = await getScoringConfig();

  const signals = await db
    .select()
    .from(companySignals)
    .where(eq(companySignals.companyId, companyId));

  const filterResult = checkHardFilters(
    { employeeCount: company.employeeCount, hqCountry: company.hqCountry },
    filters,
  );

  let totalScore = 0;
  const signalBreakdown = signals.map((s) => {
    const points = weights[s.signalType] ?? 0;
    totalScore += points;
    return {
      id: s.id,
      signalType: s.signalType,
      weight: weights[s.signalType] ?? 0,
      points,
      source: s.source,
      observedAt: s.observedAt.toISOString(),
      value: s.value,
    };
  });

  return {
    signals: signalBreakdown,
    totalScore,
    threshold,
    filtersPass: filterResult.pass,
    filterResults: {
      headcount: {
        pass: filterResult.headcount.pass,
        value: company.employeeCount,
        min: filters.headcount_min,
        max: filters.headcount_max,
      },
      geography: {
        pass: filterResult.geography.pass,
        value: company.hqCountry,
        allowed: filters.geography,
      },
    },
    meetsThreshold: totalScore >= threshold,
    qualifies: filterResult.pass && totalScore >= threshold,
  };
}
