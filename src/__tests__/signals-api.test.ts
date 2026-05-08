/**
 * Integration tests for the signals API endpoint and scoring flow.
 *
 * Mocks the database layer to test the Hono route handler + scoring logic
 * without requiring a real database connection.
 */
import { vi, describe, it, expect, beforeEach } from "vitest";

// Mock the db module
vi.mock("@/db", () => {
  return {
    db: {
      select: vi.fn(),
      insert: vi.fn(),
      update: vi.fn(),
      transaction: vi.fn(),
    },
  };
});

// Mock the scoring module
vi.mock("@/lib/scoring", () => {
  return {
    addSignal: vi.fn(),
    getScoreBreakdown: vi.fn(),
  };
});

// Mock the pipeline module (needed by companies.ts)
vi.mock("@/lib/pipeline", () => {
  return {
    transitionStatus: vi.fn(),
  };
});

import { Hono } from "hono";

const { default: companiesApp } = await import(
  "@/app/api/[[...route]]/companies"
);
const { addSignal, getScoreBreakdown } = await import("@/lib/scoring");

const mockAddSignal = vi.mocked(addSignal);
const mockGetScoreBreakdown = vi.mocked(getScoreBreakdown);

const app = new Hono();
app.route("/companies", companiesApp);

describe("POST /companies/:id/signals", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 if signalType is missing", async () => {
    const res = await app.request("/companies/abc-123/signals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("signalType is required");
  });

  it("returns 400 if signalType is invalid", async () => {
    const res = await app.request("/companies/abc-123/signals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ signalType: "bogus_type" }),
    });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/Invalid signal type/);
  });

  it("returns 404 when company is not found", async () => {
    mockAddSignal.mockResolvedValue({ ok: false, error: "Company not found" });

    const res = await app.request("/companies/abc-123/signals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ signalType: "open_sales_role" }),
    });
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toBe("Company not found");
  });

  it("returns 201 with signal and company on success", async () => {
    const fakeSignal = {
      id: "sig-1",
      signalType: "open_sales_role",
      companyId: "abc-123",
      weightAtObservation: 25,
    };
    const fakeCompany = {
      id: "abc-123",
      name: "Acme",
      status: "qualified",
      currentScore: 25,
    };
    mockAddSignal.mockResolvedValue({
      ok: true,
      signal: fakeSignal as any,
      company: fakeCompany as any,
    });

    const res = await app.request("/companies/abc-123/signals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        signalType: "open_sales_role",
        source: "LinkedIn",
      }),
    });
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.signal.id).toBe("sig-1");
    expect(body.company.currentScore).toBe(25);
  });

  it("passes source and observedAt through to addSignal", async () => {
    mockAddSignal.mockResolvedValue({
      ok: true,
      signal: { id: "sig-1" } as any,
      company: { id: "abc-123" } as any,
    });

    await app.request("/companies/abc-123/signals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        signalType: "recent_funding",
        source: "ZoomInfo",
        value: { amount: 10000000 },
      }),
    });

    expect(mockAddSignal).toHaveBeenCalledWith("abc-123", {
      signalType: "recent_funding",
      source: "ZoomInfo",
      value: { amount: 10000000 },
      observedAt: undefined,
    });
  });
});
