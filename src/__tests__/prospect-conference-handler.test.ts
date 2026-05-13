/**
 * Tests for the prospect-conference Inngest handler.
 *
 * The handler is exported separately from `createFunction` so we can drive
 * it with a fake `step` (just runs the callbacks inline) and assert on the
 * side effects (db inserts, signal adds, run counter updates).
 */
import { vi, describe, it, expect, beforeEach } from "vitest";

vi.mock("@/db", () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
  },
}));

vi.mock("@/lib/firecrawl", () => ({
  firecrawlExtractExhibitors: vi.fn(),
}));

vi.mock("@/lib/zoominfo", () => ({
  enrichCompany: vi.fn(),
  searchContacts: vi.fn(),
}));

vi.mock("@/lib/scoring", () => ({
  addSignal: vi.fn(),
}));

vi.mock("@/inngest/client", () => ({
  inngest: {
    createFunction: vi.fn((cfg, trigger, handler) => ({ cfg, trigger, handler })),
  },
}));

const { prospectConferenceHandler } = await import(
  "@/inngest/functions/prospect-conference"
);
const { db } = await import("@/db");
const { firecrawlExtractExhibitors } = await import("@/lib/firecrawl");
const { enrichCompany, searchContacts } = await import("@/lib/zoominfo");
const { addSignal } = await import("@/lib/scoring");

const mockDb = vi.mocked(db);
const mockExtract = vi.mocked(firecrawlExtractExhibitors);
const mockEnrich = vi.mocked(enrichCompany);
const mockSearchContacts = vi.mocked(searchContacts);
const mockAddSignal = vi.mocked(addSignal);

const passThroughStep = {
  run: async <T>(_id: string, fn: () => Promise<T> | T) => fn(),
};

const baseEvent = {
  data: {
    runId: "run-1",
    industryId: "ind-1",
    conferenceUrl: "https://example.com/expo",
    conferenceName: "Acme Expo",
    metas: [] as Array<{ label: string; searchTerms: string[] | null }>,
  },
};

function mockLoadIndustry(industry: {
  id: string;
  label: string;
  searchTerms: string[] | null;
}) {
  // db.select().from().where().limit() → [industry]
  const limit = vi.fn().mockResolvedValue([industry]);
  const where = vi.fn().mockReturnValue({ limit });
  const from = vi.fn().mockReturnValue({ where });
  mockDb.select.mockReturnValueOnce({ from } as never);
}

function mockExistingCompanyLookup(rows: Array<{ id: string }>) {
  const limit = vi.fn().mockResolvedValue(rows);
  const where = vi.fn().mockReturnValue({ limit });
  const from = vi.fn().mockReturnValue({ where });
  mockDb.select.mockReturnValueOnce({ from } as never);
}

function mockCompanyInsertReturns(id: string) {
  const returning = vi.fn().mockResolvedValue([{ id }]);
  const values = vi.fn().mockReturnValue({ returning });
  mockDb.insert.mockReturnValueOnce({ values } as never);
}

function mockContactInsert(opts: { throwErr?: unknown } = {}) {
  const values = vi.fn().mockImplementation(() => {
    if (opts.throwErr) return Promise.reject(opts.throwErr);
    return Promise.resolve([{ id: "contact-1" }]);
  });
  mockDb.insert.mockReturnValueOnce({ values } as never);
}

function mockRunCounterUpdate() {
  const where = vi.fn().mockResolvedValue([]);
  const set = vi.fn().mockReturnValue({ where });
  mockDb.update.mockReturnValueOnce({ set } as never);
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("prospectConferenceHandler", () => {
  it("returns zero counts and skips enrichment when no exhibitors are found", async () => {
    mockLoadIndustry({
      id: "ind-1",
      label: "Industrial Manufacturing",
      searchTerms: null,
    });
    mockExtract.mockResolvedValue([]);

    const result = await prospectConferenceHandler({
      event: baseEvent,
      step: passThroughStep,
    });

    expect(result).toEqual({ prospectsAdded: 0, contactsAdded: 0 });
    expect(mockEnrich).not.toHaveBeenCalled();
    expect(mockDb.insert).not.toHaveBeenCalled();
  });

  it("excludes companies whose headcount is outside the 300-500 window", async () => {
    mockLoadIndustry({ id: "ind-1", label: "Manufacturing", searchTerms: null });
    mockExtract.mockResolvedValue([{ name: "Tiny Co", website: "tiny.com" }]);
    mockEnrich.mockResolvedValue({
      id: 1,
      name: "Tiny Co",
      website: "tiny.com",
      employeeCount: 100, // below window
      industries: ["Manufacturing"],
    });
    mockRunCounterUpdate();

    const result = await prospectConferenceHandler({
      event: baseEvent,
      step: passThroughStep,
    });

    expect(result).toEqual({ prospectsAdded: 0, contactsAdded: 0 });
    expect(mockDb.insert).not.toHaveBeenCalled();
    expect(mockAddSignal).not.toHaveBeenCalled();
  });

  it("excludes companies whose industry doesn't match the prospecting target", async () => {
    mockLoadIndustry({ id: "ind-1", label: "Manufacturing", searchTerms: null });
    mockExtract.mockResolvedValue([{ name: "Off Topic Co", website: "off.com" }]);
    mockEnrich.mockResolvedValue({
      id: 2,
      name: "Off Topic Co",
      website: "off.com",
      employeeCount: 400, // in window
      industries: ["Healthcare"], // doesn't match
    });
    mockRunCounterUpdate();

    const result = await prospectConferenceHandler({
      event: baseEvent,
      step: passThroughStep,
    });

    expect(result).toEqual({ prospectsAdded: 0, contactsAdded: 0 });
    expect(mockDb.insert).not.toHaveBeenCalled();
  });

  it("inserts a new company, adds the event_exhibitor signal, and dedupes contacts", async () => {
    mockLoadIndustry({ id: "ind-1", label: "Manufacturing", searchTerms: null });
    mockExtract.mockResolvedValue([{ name: "Match Co", website: "match.com" }]);
    mockEnrich.mockResolvedValue({
      id: 3,
      name: "Match Co",
      website: "match.com",
      employeeCount: 400,
      industries: ["Industrial Manufacturing"],
    });
    mockExistingCompanyLookup([]); // not in db yet
    mockCompanyInsertReturns("co-new");
    mockAddSignal.mockResolvedValue({
      ok: true,
      signal: {} as never,
      company: {} as never,
    });
    mockSearchContacts.mockResolvedValue([
      {
        id: 99,
        firstName: "Jane",
        lastName: "Smith",
        jobTitle: "VP Sales",
      },
    ]);
    mockContactInsert();
    mockRunCounterUpdate();

    const result = await prospectConferenceHandler({
      event: baseEvent,
      step: passThroughStep,
    });

    expect(result).toEqual({ prospectsAdded: 1, contactsAdded: 1 });
    expect(mockAddSignal).toHaveBeenCalledWith(
      "co-new",
      expect.objectContaining({ signalType: "event_exhibitor" }),
    );
  });

  it("does not re-insert an existing company but still adds the signal and new contacts", async () => {
    mockLoadIndustry({ id: "ind-1", label: "Manufacturing", searchTerms: null });
    mockExtract.mockResolvedValue([{ name: "Known Co", website: "known.com" }]);
    mockEnrich.mockResolvedValue({
      id: 4,
      name: "Known Co",
      website: "known.com",
      employeeCount: 400,
      industries: ["Manufacturing"],
    });
    mockExistingCompanyLookup([{ id: "co-existing" }]);
    // NO mockCompanyInsertReturns — if the handler tries to insert a company,
    // it'll grab the next-queued mock (the contact one) and corrupt the test.
    mockAddSignal.mockResolvedValue({
      ok: true,
      signal: {} as never,
      company: {} as never,
    });
    mockSearchContacts.mockResolvedValue([
      { id: 100, firstName: "Sam", lastName: "Lee", jobTitle: "Director" },
    ]);
    mockContactInsert();
    mockRunCounterUpdate();

    const result = await prospectConferenceHandler({
      event: baseEvent,
      step: passThroughStep,
    });

    expect(result).toEqual({ prospectsAdded: 0, contactsAdded: 1 });
    expect(mockAddSignal).toHaveBeenCalledWith(
      "co-existing",
      expect.objectContaining({ signalType: "event_exhibitor" }),
    );
  });

  it("silently skips contacts that hit the unique-constraint violation (23505)", async () => {
    mockLoadIndustry({ id: "ind-1", label: "Manufacturing", searchTerms: null });
    mockExtract.mockResolvedValue([{ name: "Match Co", website: "match.com" }]);
    mockEnrich.mockResolvedValue({
      id: 5,
      name: "Match Co",
      website: "match.com",
      employeeCount: 400,
      industries: ["Manufacturing"],
    });
    mockExistingCompanyLookup([]);
    mockCompanyInsertReturns("co-1");
    mockAddSignal.mockResolvedValue({
      ok: true,
      signal: {} as never,
      company: {} as never,
    });
    mockSearchContacts.mockResolvedValue([
      { id: 200, firstName: "Dup", lastName: "Person", jobTitle: "VP" },
    ]);
    mockContactInsert({ throwErr: { code: "23505" } });
    mockRunCounterUpdate();

    const result = await prospectConferenceHandler({
      event: baseEvent,
      step: passThroughStep,
    });

    expect(result).toEqual({ prospectsAdded: 1, contactsAdded: 0 });
  });

  it("matches a company via a meta when the vertical alone wouldn't (industry-match union)", async () => {
    // Vertical = "TICC Contractors"; company is tagged only "Oil & Gas Services".
    // Without metas this would be filtered out; with the Oil & Gas meta active,
    // it should match.
    mockLoadIndustry({ id: "ind-1", label: "TICC Contractors", searchTerms: null });
    mockExtract.mockResolvedValue([
      { name: "Meta Match Co", website: "metamatch.com" },
    ]);
    mockEnrich.mockResolvedValue({
      id: 7,
      name: "Meta Match Co",
      website: "metamatch.com",
      employeeCount: 400,
      industries: ["Oil & Gas Services"], // doesn't contain "TICC"
    });
    mockExistingCompanyLookup([]);
    mockCompanyInsertReturns("co-meta");
    mockAddSignal.mockResolvedValue({
      ok: true,
      signal: {} as never,
      company: {} as never,
    });
    mockSearchContacts.mockResolvedValue([]);
    mockRunCounterUpdate();

    const result = await prospectConferenceHandler({
      event: {
        ...baseEvent,
        data: {
          ...baseEvent.data,
          metas: [{ label: "Oil & Gas", searchTerms: null }],
        },
      },
      step: passThroughStep,
    });

    expect(result.prospectsAdded).toBe(1);
  });

  it("rethrows contact insert errors that are NOT unique violations", async () => {
    mockLoadIndustry({ id: "ind-1", label: "Manufacturing", searchTerms: null });
    mockExtract.mockResolvedValue([{ name: "Match Co", website: "match.com" }]);
    mockEnrich.mockResolvedValue({
      id: 6,
      name: "Match Co",
      website: "match.com",
      employeeCount: 400,
      industries: ["Manufacturing"],
    });
    mockExistingCompanyLookup([]);
    mockCompanyInsertReturns("co-2");
    mockAddSignal.mockResolvedValue({
      ok: true,
      signal: {} as never,
      company: {} as never,
    });
    mockSearchContacts.mockResolvedValue([
      { id: 300, firstName: "Real", lastName: "Bug", jobTitle: "VP" },
    ]);
    mockContactInsert({ throwErr: { code: "23503" } }); // FK violation
    mockRunCounterUpdate();

    await expect(
      prospectConferenceHandler({ event: baseEvent, step: passThroughStep }),
    ).rejects.toMatchObject({ code: "23503" });
  });
});
