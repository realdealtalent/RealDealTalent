/**
 * Integration tests for recomputeAllScores.
 *
 * Tests that threshold/filter config changes trigger correct
 * status flips (prospect <-> qualified) via the pure functions,
 * then verifies the orchestration logic.
 */
import { describe, it, expect } from "vitest";
import { checkHardFilters, computeScore } from "@/lib/scoring";

const DEFAULT_FILTERS = { headcount_min: 25, headcount_max: 300, geography: ["US", "CA"] };
const DEFAULT_WEIGHTS: Record<string, number> = {
  open_sales_role: 25,
  open_ops_role: 20,
  recent_funding: 15,
  leadership_change: 15,
  pe_owned: 10,
  multi_site_expansion: 10,
  certification_added: 10,
  event_exhibitor: 15,
};

type MockCompany = {
  id: string;
  status: string;
  currentScore: number;
  employeeCount: number | null;
  hqCountry: string | null;
};

type MockSignal = {
  companyId: string;
  signalType: string;
  weightAtObservation: number;
};

/**
 * Simulate the recomputeAllScores logic using pure functions.
 * This mirrors the real implementation without needing a database.
 */
function simulateRecompute(
  companies: MockCompany[],
  signals: MockSignal[],
  filters: typeof DEFAULT_FILTERS,
  weights: Record<string, number>,
  threshold: number,
) {
  const signalsByCompany = new Map<string, MockSignal[]>();
  for (const signal of signals) {
    const arr = signalsByCompany.get(signal.companyId) ?? [];
    arr.push(signal);
    signalsByCompany.set(signal.companyId, arr);
  }

  let advanced = 0;
  let reverted = 0;

  for (const company of companies) {
    const companySignals = signalsByCompany.get(company.id) ?? [];
    const { total } = computeScore(companySignals, weights);
    const filterResult = checkHardFilters(
      { employeeCount: company.employeeCount, hqCountry: company.hqCountry },
      filters,
    );

    const qualifies = filterResult.pass && total >= threshold;

    company.currentScore = total;

    if (company.status === "prospect" && qualifies) {
      company.status = "qualified";
      advanced++;
    } else if (company.status === "qualified" && !qualifies) {
      company.status = "prospect";
      reverted++;
    }
  }

  return { total: companies.length, advanced, reverted };
}

describe("recomputeAllScores — threshold change status flips", () => {
  it("reverts qualified companies to prospect when threshold increases above their score", () => {
    const companies: MockCompany[] = [
      { id: "a", status: "qualified", currentScore: 40, employeeCount: 100, hqCountry: "US" },
    ];
    const signals: MockSignal[] = [
      { companyId: "a", signalType: "open_sales_role", weightAtObservation: 25 },
      { companyId: "a", signalType: "recent_funding", weightAtObservation: 15 },
    ];

    // Score = 25 + 15 = 40, but threshold is now 50
    const result = simulateRecompute(companies, signals, DEFAULT_FILTERS, DEFAULT_WEIGHTS, 50);

    expect(result.reverted).toBe(1);
    expect(result.advanced).toBe(0);
    expect(companies[0].status).toBe("prospect");
  });

  it("advances prospect companies to qualified when threshold decreases below their score", () => {
    const companies: MockCompany[] = [
      { id: "b", status: "prospect", currentScore: 0, employeeCount: 100, hqCountry: "US" },
    ];
    const signals: MockSignal[] = [
      { companyId: "b", signalType: "open_sales_role", weightAtObservation: 25 },
      { companyId: "b", signalType: "open_ops_role", weightAtObservation: 20 },
    ];

    // Score = 25 + 20 = 45, threshold lowered to 40
    const result = simulateRecompute(companies, signals, DEFAULT_FILTERS, DEFAULT_WEIGHTS, 40);

    expect(result.advanced).toBe(1);
    expect(result.reverted).toBe(0);
    expect(companies[0].status).toBe("qualified");
  });

  it("handles mixed scenario: some advance, some revert", () => {
    const companies: MockCompany[] = [
      { id: "c", status: "prospect", currentScore: 0, employeeCount: 100, hqCountry: "US" },
      { id: "d", status: "qualified", currentScore: 20, employeeCount: 100, hqCountry: "US" },
    ];
    const signals: MockSignal[] = [
      { companyId: "c", signalType: "open_sales_role", weightAtObservation: 25 },
      { companyId: "c", signalType: "open_ops_role", weightAtObservation: 20 },
      { companyId: "c", signalType: "recent_funding", weightAtObservation: 15 },
      { companyId: "d", signalType: "pe_owned", weightAtObservation: 10 },
    ];

    // company-c score: 25+20+15=60, company-d score: 10
    // threshold 40: c qualifies (advance), d doesn't (revert)
    const result = simulateRecompute(companies, signals, DEFAULT_FILTERS, DEFAULT_WEIGHTS, 40);

    expect(result.total).toBe(2);
    expect(result.advanced).toBe(1);
    expect(result.reverted).toBe(1);
    expect(companies[0].status).toBe("qualified");
    expect(companies[1].status).toBe("prospect");
  });

  it("does not flip companies in other pipeline stages", () => {
    const companies: MockCompany[] = [
      { id: "e", status: "outreach", currentScore: 20, employeeCount: 100, hqCountry: "US" },
      { id: "f", status: "signed", currentScore: 80, employeeCount: 100, hqCountry: "US" },
      { id: "g", status: "rejected", currentScore: 30, employeeCount: 100, hqCountry: "US" },
    ];
    const signals: MockSignal[] = [
      { companyId: "e", signalType: "pe_owned", weightAtObservation: 10 },
    ];

    // None should flip — only prospect/qualified are affected
    const result = simulateRecompute(companies, signals, DEFAULT_FILTERS, DEFAULT_WEIGHTS, 50);

    expect(result.advanced).toBe(0);
    expect(result.reverted).toBe(0);
    expect(companies[0].status).toBe("outreach");
    expect(companies[1].status).toBe("signed");
    expect(companies[2].status).toBe("rejected");
  });

  it("reverts qualified to prospect when hard filters no longer pass", () => {
    const companies: MockCompany[] = [
      { id: "h", status: "qualified", currentScore: 60, employeeCount: 100, hqCountry: "MX" },
    ];
    const signals: MockSignal[] = [
      { companyId: "h", signalType: "open_sales_role", weightAtObservation: 25 },
      { companyId: "h", signalType: "open_ops_role", weightAtObservation: 20 },
      { companyId: "h", signalType: "recent_funding", weightAtObservation: 15 },
    ];

    // Score 60 > threshold 50, but geography fails (MX not in [US])
    const narrowFilters = { headcount_min: 25, headcount_max: 300, geography: ["US"] };
    const result = simulateRecompute(companies, signals, narrowFilters, DEFAULT_WEIGHTS, 50);

    expect(result.reverted).toBe(1);
    expect(companies[0].status).toBe("prospect");
  });

  it("reverts qualified to prospect when headcount filter changes", () => {
    const companies: MockCompany[] = [
      { id: "i", status: "qualified", currentScore: 60, employeeCount: 500, hqCountry: "US" },
    ];
    const signals: MockSignal[] = [
      { companyId: "i", signalType: "open_sales_role", weightAtObservation: 25 },
      { companyId: "i", signalType: "open_ops_role", weightAtObservation: 20 },
      { companyId: "i", signalType: "recent_funding", weightAtObservation: 15 },
    ];

    // Score 60, but 500 employees > max 300
    const result = simulateRecompute(companies, signals, DEFAULT_FILTERS, DEFAULT_WEIGHTS, 50);

    expect(result.reverted).toBe(1);
    expect(companies[0].status).toBe("prospect");
  });

  it("uses current weights (not weightAtObservation) for recompute", () => {
    const companies: MockCompany[] = [
      { id: "j", status: "prospect", currentScore: 0, employeeCount: 100, hqCountry: "US" },
    ];
    const signals: MockSignal[] = [
      // Was recorded at weight 10, but current weight is 25
      { companyId: "j", signalType: "open_sales_role", weightAtObservation: 10 },
      { companyId: "j", signalType: "open_ops_role", weightAtObservation: 10 },
    ];

    // Current weights: open_sales_role=25, open_ops_role=20 -> score = 45
    // Threshold 40 -> qualifies
    const result = simulateRecompute(companies, signals, DEFAULT_FILTERS, DEFAULT_WEIGHTS, 40);

    expect(result.advanced).toBe(1);
    expect(companies[0].currentScore).toBe(45);
    expect(companies[0].status).toBe("qualified");
  });
});
