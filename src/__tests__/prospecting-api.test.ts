/**
 * Integration tests for the prospecting API.
 *
 * Mocks @/db and @/inngest/client so we exercise the Hono routes end-to-end
 * without touching Postgres or Inngest.
 */
import { vi, describe, it, expect, beforeEach } from "vitest";

vi.mock("@/db", () => {
  return {
    db: {
      select: vi.fn(),
      insert: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  };
});

vi.mock("@/inngest/client", () => {
  return {
    inngest: { send: vi.fn() },
  };
});

import { Hono } from "hono";

const { default: prospectingApp } = await import(
  "@/app/api/[[...route]]/prospecting"
);
const { db } = await import("@/db");
const { inngest } = await import("@/inngest/client");

const app = new Hono();
app.route("/prospecting", prospectingApp);

const mockDb = vi.mocked(db);
const mockSend = vi.mocked(inngest.send);

// --- helpers to mock Drizzle's chain ---

function mockInsertReturning<T>(rows: T[]) {
  const returning = vi.fn().mockResolvedValue(rows);
  const values = vi.fn().mockReturnValue({ returning });
  mockDb.insert.mockReturnValue({ values } as never);
  return { values, returning };
}

function mockSelectFromWhereLimit<T>(rows: T[]) {
  const limit = vi.fn().mockResolvedValue(rows);
  const where = vi.fn().mockReturnValue({ limit });
  const from = vi.fn().mockReturnValue({ where });
  mockDb.select.mockReturnValue({ from } as never);
  return { from, where, limit };
}

function mockSelectFromWhereOrderByLimit<T>(rows: T[]) {
  const orderBy = vi.fn().mockReturnValue(Promise.resolve(rows));
  const where = vi.fn().mockReturnValue({ orderBy, limit: vi.fn().mockResolvedValue(rows) });
  const from = vi.fn().mockReturnValue({ where, orderBy });
  mockDb.select.mockReturnValue({ from } as never);
  return { from, where, orderBy };
}

describe("POST /prospecting/run", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a parent run row and returns its id", async () => {
    const { values } = mockInsertReturning([{ id: "parent-1", status: "pending" }]);
    mockSend.mockResolvedValue({ ids: ["evt-1"] } as never);

    const res = await app.request("/prospecting/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    expect(res.status).toBe(202);
    const body = await res.json();
    expect(body.runId).toBe("parent-1");
    expect(values).toHaveBeenCalledWith({ status: "pending" });
  });

  it("dispatches the prospecting/run.requested event with the parent runId", async () => {
    mockInsertReturning([{ id: "parent-2", status: "pending" }]);
    mockSend.mockResolvedValue({ ids: ["evt-1"] } as never);

    await app.request("/prospecting/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    expect(mockSend).toHaveBeenCalledWith({
      name: "prospecting/run.requested",
      data: { parentRunId: "parent-2", industryIds: undefined },
    });
  });

  it("forwards industryIds when provided", async () => {
    mockInsertReturning([{ id: "parent-3", status: "pending" }]);
    mockSend.mockResolvedValue({ ids: ["evt-1"] } as never);

    await app.request("/prospecting/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ industryIds: ["ind-a", "ind-b"] }),
    });

    expect(mockSend).toHaveBeenCalledWith({
      name: "prospecting/run.requested",
      data: { parentRunId: "parent-3", industryIds: ["ind-a", "ind-b"] },
    });
  });

  it("cleans up the orphan parent run row when Inngest send fails", async () => {
    mockInsertReturning([{ id: "parent-fail", status: "pending" }]);
    mockSend.mockRejectedValue(new Error("inngest down"));

    const deleteWhere = vi.fn().mockResolvedValue([]);
    mockDb.delete.mockReturnValue({ where: deleteWhere } as never);

    const res = await app.request("/prospecting/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    expect(res.status).toBe(502);
    expect(mockDb.delete).toHaveBeenCalled();
  });

  it("rejects non-array industryIds", async () => {
    const res = await app.request("/prospecting/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ industryIds: "not-an-array" }),
    });
    expect(res.status).toBe(400);
  });
});

describe("POST /prospecting/industries", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 when label is missing or empty", async () => {
    const res = await app.request("/prospecting/industries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/label/i);
  });

  it("returns 409 when label already exists", async () => {
    mockSelectFromWhereLimit([{ id: "existing-1" }]);

    const res = await app.request("/prospecting/industries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label: "Manufacturing" }),
    });

    expect(res.status).toBe(409);
  });

  it("creates and returns the new industry with 201 (default kind=vertical)", async () => {
    mockSelectFromWhereLimit([]); // no existing
    const { values } = mockInsertReturning([
      {
        id: "ind-1",
        label: "Manufacturing",
        kind: "vertical",
        searchTerms: ["CNC"],
        active: true,
        sortOrder: 0,
      },
    ]);

    const res = await app.request("/prospecting/industries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        label: "Manufacturing",
        searchTerms: ["CNC"],
      }),
    });

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.id).toBe("ind-1");
    expect(values).toHaveBeenCalledWith(
      expect.objectContaining({
        label: "Manufacturing",
        kind: "vertical",
        searchTerms: ["CNC"],
        active: true,
      }),
    );
  });

  it("accepts kind=meta when provided", async () => {
    mockSelectFromWhereLimit([]);
    const { values } = mockInsertReturning([
      { id: "meta-1", label: "Oil & Gas", kind: "meta", active: true },
    ]);

    const res = await app.request("/prospecting/industries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label: "Oil & Gas", kind: "meta" }),
    });

    expect(res.status).toBe(201);
    expect(values).toHaveBeenCalledWith(
      expect.objectContaining({ label: "Oil & Gas", kind: "meta" }),
    );
  });

  it("rejects unknown kind values with 400", async () => {
    const res = await app.request("/prospecting/industries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label: "Bogus", kind: "supercategory" }),
    });

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/kind/i);
  });
});

describe("GET /prospecting/runs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns only parent runs (filters out children)", async () => {
    const limit = vi.fn().mockResolvedValue([
      { id: "parent-1", parentRunId: null },
      { id: "parent-2", parentRunId: null },
    ]);
    const orderBy = vi.fn().mockReturnValue({ limit });
    const where = vi.fn().mockReturnValue({ orderBy });
    const from = vi.fn().mockReturnValue({ where });
    mockDb.select.mockReturnValue({ from } as never);

    const res = await app.request("/prospecting/runs");

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveLength(2);
    expect(where).toHaveBeenCalled(); // the parentRunId IS NULL filter
  });
});
