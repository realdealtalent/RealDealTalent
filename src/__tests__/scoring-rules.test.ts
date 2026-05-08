import { checkHardFilters, computeScore } from "@/lib/scoring";

describe("checkHardFilters", () => {
  const filters = { headcount_min: 25, headcount_max: 300, geography: ["US", "CA"] };

  it("passes when headcount and geography are within range", () => {
    const result = checkHardFilters({ employeeCount: 100, hqCountry: "US" }, filters);
    expect(result.pass).toBe(true);
    expect(result.headcount.pass).toBe(true);
    expect(result.geography.pass).toBe(true);
  });

  it("passes at exact headcount boundaries", () => {
    expect(checkHardFilters({ employeeCount: 25, hqCountry: "US" }, filters).pass).toBe(true);
    expect(checkHardFilters({ employeeCount: 300, hqCountry: "CA" }, filters).pass).toBe(true);
  });

  it("fails when headcount is below minimum", () => {
    const result = checkHardFilters({ employeeCount: 10, hqCountry: "US" }, filters);
    expect(result.pass).toBe(false);
    expect(result.headcount.pass).toBe(false);
    expect(result.geography.pass).toBe(true);
  });

  it("fails when headcount is above maximum", () => {
    const result = checkHardFilters({ employeeCount: 500, hqCountry: "US" }, filters);
    expect(result.pass).toBe(false);
    expect(result.headcount.pass).toBe(false);
  });

  it("fails when headcount is null", () => {
    const result = checkHardFilters({ employeeCount: null, hqCountry: "US" }, filters);
    expect(result.pass).toBe(false);
    expect(result.headcount.pass).toBe(false);
  });

  it("fails when geography is outside allowed list", () => {
    const result = checkHardFilters({ employeeCount: 100, hqCountry: "MX" }, filters);
    expect(result.pass).toBe(false);
    expect(result.geography.pass).toBe(false);
    expect(result.headcount.pass).toBe(true);
  });

  it("fails when geography is null", () => {
    const result = checkHardFilters({ employeeCount: 100, hqCountry: null }, filters);
    expect(result.pass).toBe(false);
    expect(result.geography.pass).toBe(false);
  });

  it("is case-insensitive on geography matching", () => {
    const result = checkHardFilters({ employeeCount: 100, hqCountry: "us" }, filters);
    expect(result.geography.pass).toBe(true);
  });

  it("fails both when headcount and geography are out of range", () => {
    const result = checkHardFilters({ employeeCount: 5, hqCountry: "DE" }, filters);
    expect(result.pass).toBe(false);
    expect(result.headcount.pass).toBe(false);
    expect(result.geography.pass).toBe(false);
  });
});

describe("computeScore", () => {
  const weights: Record<string, number> = {
    open_sales_role: 25,
    open_ops_role: 20,
    recent_funding: 15,
    leadership_change: 15,
    pe_owned: 10,
  };

  it("computes score from a single signal", () => {
    const signals = [{ signalType: "open_sales_role", weightAtObservation: 25 }];
    const result = computeScore(signals, weights);
    expect(result.total).toBe(25);
    expect(result.perSignal).toEqual([{ signalType: "open_sales_role", points: 25 }]);
  });

  it("computes score from multiple signals", () => {
    const signals = [
      { signalType: "open_sales_role", weightAtObservation: 25 },
      { signalType: "recent_funding", weightAtObservation: 15 },
      { signalType: "pe_owned", weightAtObservation: 10 },
    ];
    const result = computeScore(signals, weights);
    expect(result.total).toBe(50);
    expect(result.perSignal).toHaveLength(3);
  });

  it("returns 0 for empty signal list", () => {
    const result = computeScore([], weights);
    expect(result.total).toBe(0);
    expect(result.perSignal).toEqual([]);
  });

  it("gives 0 points for unknown signal types", () => {
    const signals = [{ signalType: "unknown_signal", weightAtObservation: 0 }];
    const result = computeScore(signals, weights);
    expect(result.total).toBe(0);
    expect(result.perSignal[0].points).toBe(0);
  });

  it("allows duplicate signal types (multiple observations)", () => {
    const signals = [
      { signalType: "open_sales_role", weightAtObservation: 25 },
      { signalType: "open_sales_role", weightAtObservation: 25 },
    ];
    const result = computeScore(signals, weights);
    expect(result.total).toBe(50);
  });

  it("uses current weights not weight_at_observation", () => {
    const newWeights = { ...weights, open_sales_role: 30 };
    const signals = [{ signalType: "open_sales_role", weightAtObservation: 25 }];
    const result = computeScore(signals, newWeights);
    expect(result.total).toBe(30);
  });
});
