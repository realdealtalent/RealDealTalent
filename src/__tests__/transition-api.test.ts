/**
 * Integration tests for the transition API endpoint.
 *
 * These tests mock the database layer to test the Hono route handler logic
 * without requiring a real database connection.
 */
import { vi, describe, it, expect, beforeEach } from "vitest";

// Mock the db module before any imports that use it
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

// Mock the pipeline module to isolate API layer testing
vi.mock("@/lib/pipeline", () => {
  return {
    transitionStatus: vi.fn(),
  };
});

import { Hono } from "hono";

// We need to import the companies app after mocking
const { default: companiesApp } = await import(
  "@/app/api/[[...route]]/companies"
);
const { transitionStatus } = await import("@/lib/pipeline");

const mockTransition = vi.mocked(transitionStatus);

const app = new Hono();
app.route("/companies", companiesApp);

describe("POST /companies/:id/transition", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 if status is missing", async () => {
    const res = await app.request("/companies/abc-123/transition", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("status is required");
  });

  it("returns 400 if status is invalid", async () => {
    const res = await app.request("/companies/abc-123/transition", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "bogus" }),
    });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/Invalid status/);
  });

  it("returns 400 when transitionStatus returns an error", async () => {
    mockTransition.mockResolvedValue({
      ok: false,
      error: "Rejecting a company requires a lost reason",
    });

    const res = await app.request("/companies/abc-123/transition", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "rejected" }),
    });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("Rejecting a company requires a lost reason");
  });

  it("returns 200 with updated company on success", async () => {
    const fakeCompany = {
      id: "abc-123",
      name: "Acme",
      status: "qualified",
    };
    mockTransition.mockResolvedValue({ ok: true, company: fakeCompany as any });

    const res = await app.request("/companies/abc-123/transition", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "qualified" }),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.id).toBe("abc-123");
    expect(body.status).toBe("qualified");
  });

  it("passes lostReasonSlug and note through to transitionStatus", async () => {
    mockTransition.mockResolvedValue({
      ok: true,
      company: { id: "abc-123", status: "rejected" } as any,
    });

    await app.request("/companies/abc-123/transition", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: "rejected",
        lostReasonSlug: "no_budget",
        note: "They have no budget this year",
      }),
    });

    expect(mockTransition).toHaveBeenCalledWith("abc-123", "rejected", {
      lostReasonSlug: "no_budget",
      note: "They have no budget this year",
      changedBy: undefined,
    });
  });
});
