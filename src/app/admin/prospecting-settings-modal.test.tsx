import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ProspectingSettingsModal from "./prospecting-settings-modal";

type RouteResponses = Record<string, unknown>;

function installFetchMock(responses: RouteResponses) {
  const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input.toString();
    const method = init?.method ?? "GET";
    const key = `${method} ${url}`;

    if (key in responses) {
      const value = responses[key];
      return {
        ok: true,
        status: 200,
        json: async () => value,
      } as Response;
    }

    // Default empty success — keeps tests focused on the routes they care about.
    return { ok: true, status: 200, json: async () => [] } as Response;
  });
  globalThis.fetch = fetchMock as never;
  return fetchMock;
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("ProspectingSettingsModal", () => {
  it("renders verticals in the 'Industries to Prospect' section", async () => {
    installFetchMock({
      "GET /api/prospecting/industries": [
        { id: "i-1", label: "Industrial Manufacturing", kind: "vertical", searchTerms: ["CNC"], active: true, sortOrder: 0 },
        { id: "i-2", label: "Logistics", kind: "vertical", searchTerms: null, active: true, sortOrder: 1 },
      ],
      "GET /api/prospecting/runs": [],
    });

    render(<ProspectingSettingsModal onClose={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText("Industrial Manufacturing")).toBeInTheDocument();
    });
    expect(screen.getByText("Logistics")).toBeInTheDocument();
    expect(screen.getByText(/CNC/)).toBeInTheDocument();
  });

  it("renders metas in the 'Operating Context' section and hides 'Run just this' for them", async () => {
    installFetchMock({
      "GET /api/prospecting/industries": [
        { id: "m-1", label: "Oil & Gas", kind: "meta", searchTerms: ["pipeline"], active: true, sortOrder: 0 },
        { id: "v-1", label: "TICC Contractors", kind: "vertical", searchTerms: null, active: true, sortOrder: 10 },
      ],
      "GET /api/prospecting/runs": [],
    });

    render(<ProspectingSettingsModal onClose={() => {}} />);

    await screen.findByText("Oil & Gas");
    expect(screen.getByText("Operating Context")).toBeInTheDocument();

    // "Run just this" should only appear for verticals — one button total.
    const runButtons = screen.queryAllByRole("button", { name: /run just this/i });
    expect(runButtons).toHaveLength(1);
  });

  it("disables the Add Industry button when the label is empty", async () => {
    installFetchMock({});
    render(<ProspectingSettingsModal onClose={() => {}} />);

    const addButton = await screen.findByRole("button", { name: /add industry/i });
    expect(addButton).toBeDisabled();

    const labelInput = screen.getByLabelText(/^label$/i);
    fireEvent.change(labelInput, { target: { value: "Logistics" } });
    expect(addButton).not.toBeDisabled();
  });

  it("posts a new industry and appends it to the list", async () => {
    const fetchMock = installFetchMock({
      "GET /api/prospecting/industries": [],
      "GET /api/prospecting/runs": [],
      "POST /api/prospecting/industries": {
        id: "i-new",
        label: "Logistics",
        kind: "vertical",
        searchTerms: ["3PL"],
        active: true,
        sortOrder: 0,
      },
    });

    render(<ProspectingSettingsModal onClose={() => {}} />);

    // Wait for initial load to settle.
    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith("/api/prospecting/industries"),
    );

    fireEvent.change(screen.getByLabelText(/^label$/i), {
      target: { value: "Logistics" },
    });
    fireEvent.change(screen.getByLabelText(/search terms/i), {
      target: { value: "3PL" },
    });

    fireEvent.click(screen.getByRole("button", { name: /add industry/i }));

    await waitFor(() => {
      expect(screen.getByText("Logistics")).toBeInTheDocument();
    });

    const postCall = fetchMock.mock.calls.find(
      ([, init]) => (init as RequestInit | undefined)?.method === "POST",
    );
    expect(postCall).toBeDefined();
    const body = JSON.parse(((postCall![1] as RequestInit).body as string) ?? "{}");
    expect(body).toEqual({
      label: "Logistics",
      kind: "vertical",
      searchTerms: ["3PL"],
    });
  });

  it("posts kind=meta when the kind selector is set to meta", async () => {
    const fetchMock = installFetchMock({
      "GET /api/prospecting/industries": [],
      "GET /api/prospecting/runs": [],
      "POST /api/prospecting/industries": {
        id: "m-new",
        label: "Renewables",
        kind: "meta",
        searchTerms: null,
        active: true,
        sortOrder: 0,
      },
    });

    render(<ProspectingSettingsModal onClose={() => {}} />);
    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith("/api/prospecting/industries"),
    );

    fireEvent.change(screen.getByLabelText(/^kind$/i), {
      target: { value: "meta" },
    });
    fireEvent.change(screen.getByLabelText(/^label$/i), {
      target: { value: "Renewables" },
    });

    fireEvent.click(screen.getByRole("button", { name: /add industry/i }));

    await waitFor(() => {
      const postCall = fetchMock.mock.calls.find(
        ([, init]) => (init as RequestInit | undefined)?.method === "POST",
      );
      expect(postCall).toBeDefined();
      const body = JSON.parse(((postCall![1] as RequestInit).body as string) ?? "{}");
      expect(body.kind).toBe("meta");
    });
  });

  it("removes an industry from the list when delete succeeds", async () => {
    const fetchMock = installFetchMock({
      "GET /api/prospecting/industries": [
        { id: "i-doomed", label: "ToDelete", kind: "vertical", searchTerms: null, active: true, sortOrder: 0 },
      ],
      "GET /api/prospecting/runs": [],
      "DELETE /api/prospecting/industries/i-doomed": { ok: true },
    });

    render(<ProspectingSettingsModal onClose={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText("ToDelete")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /delete/i }));

    await waitFor(() => {
      expect(screen.queryByText("ToDelete")).not.toBeInTheDocument();
    });

    expect(
      fetchMock.mock.calls.some(
        ([url, init]) =>
          url === "/api/prospecting/industries/i-doomed" &&
          (init as RequestInit | undefined)?.method === "DELETE",
      ),
    ).toBe(true);
  });

  it("posts /api/prospecting/run with the single industryId when 'Run just this' is clicked", async () => {
    const fetchMock = installFetchMock({
      "GET /api/prospecting/industries": [
        { id: "i-target", label: "Target", kind: "vertical", searchTerms: null, active: true, sortOrder: 0 },
      ],
      "GET /api/prospecting/runs": [],
      "POST /api/prospecting/run": { runId: "run-123" },
    });

    render(<ProspectingSettingsModal onClose={() => {}} />);

    await screen.findByText("Target");

    fireEvent.click(screen.getByRole("button", { name: /run just this/i }));

    await waitFor(() => {
      const runCall = fetchMock.mock.calls.find(
        ([url, init]) =>
          url === "/api/prospecting/run" &&
          (init as RequestInit | undefined)?.method === "POST",
      );
      expect(runCall).toBeDefined();
      const body = JSON.parse(((runCall![1] as RequestInit).body as string) ?? "{}");
      expect(body).toEqual({ industryIds: ["i-target"] });
    });
  });
});
