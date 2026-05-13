"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/button";
import { FormField, FormMessage, Input, Select } from "@/components/forms";
import { Modal } from "@/components/modal";
import { Toast } from "@/components/toast";

type IndustryKind = "meta" | "vertical";

type Industry = {
  id: string;
  label: string;
  kind: IndustryKind;
  searchTerms: string[] | null;
  active: boolean;
  sortOrder: number;
};

type ProspectingRun = {
  id: string;
  parentRunId: string | null;
  industryId: string | null;
  status: string;
  conferencesFound: number;
  exhibitorsScraped: number;
  companiesEnriched: number;
  prospectsAdded: number;
  contactsAdded: number;
  error: string | null;
  startedAt: string;
  finishedAt: string | null;
};

type Props = {
  onClose: () => void;
};

export default function ProspectingSettingsModal({ onClose }: Props) {
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [runs, setRuns] = useState<ProspectingRun[]>([]);
  const [loading, setLoading] = useState(true);

  const [newLabel, setNewLabel] = useState("");
  const [newKind, setNewKind] = useState<IndustryKind>("vertical");
  const [newTerms, setNewTerms] = useState("");
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  const [message, setMessage] = useState<
    { type: "success" | "error"; text: string } | null
  >(null);

  const fetchAll = useCallback(async () => {
    const [iRes, rRes] = await Promise.all([
      fetch("/api/prospecting/industries"),
      fetch("/api/prospecting/runs"),
    ]);
    if (iRes.ok) setIndustries(await iRes.json());
    if (rRes.ok) setRuns(await rRes.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const addIndustry = async () => {
    if (!newLabel.trim()) return;
    setAdding(true);
    setAddError(null);

    const res = await fetch("/api/prospecting/industries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        label: newLabel.trim(),
        kind: newKind,
        searchTerms: newTerms
          ? newTerms.split(",").map((t) => t.trim()).filter(Boolean)
          : undefined,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setAddError(data.error || "Failed to add");
      setAdding(false);
      return;
    }

    const created: Industry = await res.json();
    setIndustries((prev) => [...prev, created]);
    setNewLabel("");
    setNewTerms("");
    setNewKind("vertical");
    setAdding(false);
  };

  const toggleActive = async (industry: Industry) => {
    const next = { ...industry, active: !industry.active };
    setIndustries((prev) => prev.map((i) => (i.id === industry.id ? next : i)));

    const res = await fetch(`/api/prospecting/industries/${industry.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: next.active }),
    });

    if (!res.ok) {
      // Revert
      setIndustries((prev) =>
        prev.map((i) => (i.id === industry.id ? industry : i)),
      );
      setMessage({ type: "error", text: "Failed to toggle industry" });
    }
  };

  const deleteIndustry = async (id: string) => {
    const res = await fetch(`/api/prospecting/industries/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      setMessage({ type: "error", text: "Failed to delete industry" });
      return;
    }
    setIndustries((prev) => prev.filter((i) => i.id !== id));
  };

  const runSingleIndustry = async (industryId: string) => {
    const res = await fetch("/api/prospecting/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ industryIds: [industryId] }),
    });
    if (!res.ok) {
      setMessage({ type: "error", text: "Failed to start run" });
      return;
    }
    setMessage({ type: "success", text: "Run started — refresh runs below to track progress" });
    fetchAll();
  };

  return (
    <Modal
      title="Prospecting Settings"
      onClose={onClose}
      className="max-w-2xl max-h-[90vh] overflow-y-auto"
    >
      <div className="p-6 space-y-6">
        {message && (
          <Toast
            type={message.type}
            message={message.text}
            onDismiss={() => setMessage(null)}
          />
        )}

        <section>
          <h3 className="text-sm font-semibold text-gray-900 mb-1">
            Operating Context
          </h3>
          <p className="text-xs text-gray-500 mb-3">
            Always-applied context (Oil &amp; Gas, Industrial Services). Active
            metas are appended to every search query and act as a fallback
            industry match for companies whose tags don&apos;t precisely line up
            with a vertical.
          </p>

          {loading ? (
            <p className="text-sm text-gray-400">Loading…</p>
          ) : industries.filter((i) => i.kind === "meta").length === 0 ? (
            <p className="text-sm text-gray-400 italic mb-4">
              No operating context configured.
            </p>
          ) : (
            <div className="space-y-2 mb-4">
              {industries
                .filter((i) => i.kind === "meta")
                .map((ind) => (
                  <IndustryRow
                    key={ind.id}
                    industry={ind}
                    onToggle={() => toggleActive(ind)}
                    onDelete={() => deleteIndustry(ind.id)}
                    onRunJustThis={null}
                  />
                ))}
            </div>
          )}
        </section>

        <section className="border-t border-gray-200 pt-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-1">
            Industries to Prospect
          </h3>
          <p className="text-xs text-gray-500 mb-3">
            Each enabled vertical triggers its own conference search when you
            click Run Prospecting. Use search terms to refine results.
          </p>

          {loading ? null : industries.filter((i) => i.kind === "vertical")
              .length === 0 ? (
            <p className="text-sm text-gray-400 italic mb-4">
              No verticals configured yet — add one below.
            </p>
          ) : (
            <div className="space-y-2 mb-4">
              {industries
                .filter((i) => i.kind === "vertical")
                .map((ind) => (
                  <IndustryRow
                    key={ind.id}
                    industry={ind}
                    onToggle={() => toggleActive(ind)}
                    onDelete={() => deleteIndustry(ind.id)}
                    onRunJustThis={() => runSingleIndustry(ind.id)}
                  />
                ))}
            </div>
          )}

          <div className="border-t border-gray-200 pt-4">
            <h4 className="text-xs font-medium text-gray-700 mb-2">
              Add Industry
            </h4>
            {addError && (
              <FormMessage type="error" className="mb-3">
                {addError}
              </FormMessage>
            )}
            <div className="space-y-3">
              <FormField label="Kind" htmlFor="prospect-kind">
                <Select
                  id="prospect-kind"
                  value={newKind}
                  onChange={(e) => setNewKind(e.target.value as IndustryKind)}
                >
                  <option value="vertical">Vertical (industry to prospect)</option>
                  <option value="meta">Meta (operating context)</option>
                </Select>
              </FormField>
              <FormField label="Label" htmlFor="prospect-label">
                <Input
                  id="prospect-label"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  placeholder="e.g. Industrial Manufacturing"
                />
              </FormField>
              <FormField
                label="Search terms (optional, comma-separated)"
                htmlFor="prospect-terms"
              >
                <Input
                  id="prospect-terms"
                  value={newTerms}
                  onChange={(e) => setNewTerms(e.target.value)}
                  placeholder="e.g. CNC, fabrication, machining"
                />
              </FormField>
              <div className="flex justify-end">
                <Button
                  onClick={addIndustry}
                  loading={adding}
                  disabled={!newLabel.trim()}
                  size="sm"
                >
                  Add Industry
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-gray-200 pt-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900">Recent Runs</h3>
            <Button
              onClick={fetchAll}
              variant="ghost"
              size="sm"
              className="text-blue-600 hover:bg-transparent"
            >
              Refresh
            </Button>
          </div>

          {runs.length === 0 ? (
            <p className="text-sm text-gray-400 italic">No runs yet.</p>
          ) : (
            <div className="space-y-2">
              {runs.map((run) => (
                <div
                  key={run.id}
                  className="rounded-md border border-gray-200 bg-white px-3 py-2 text-xs"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-gray-500">
                      {new Date(run.startedAt).toLocaleString()}
                    </span>
                    <RunStatusPill status={run.status} />
                  </div>
                  <div className="text-gray-600">
                    {run.prospectsAdded} new prospects · {run.contactsAdded}{" "}
                    new contacts · {run.conferencesFound} conferences ·{" "}
                    {run.companiesEnriched} enriched
                  </div>
                  {run.error && (
                    <p className="mt-1 text-red-600">{run.error}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </Modal>
  );
}

function IndustryRow({
  industry,
  onToggle,
  onDelete,
  onRunJustThis,
}: {
  industry: Industry;
  onToggle: () => void;
  onDelete: () => void;
  onRunJustThis: (() => void) | null;
}) {
  return (
    <div
      className={`flex items-center gap-3 rounded-md border px-3 py-2 text-sm ${
        industry.active
          ? "border-gray-200 bg-white"
          : "border-gray-100 bg-gray-50 opacity-60"
      }`}
    >
      <input
        type="checkbox"
        checked={industry.active}
        onChange={onToggle}
        aria-label={`${industry.label} active`}
      />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 truncate">{industry.label}</p>
        {industry.searchTerms && industry.searchTerms.length > 0 && (
          <p className="text-xs text-gray-500 truncate">
            terms: {industry.searchTerms.join(", ")}
          </p>
        )}
      </div>
      {onRunJustThis && (
        <Button
          onClick={onRunJustThis}
          variant="secondary"
          size="sm"
          disabled={!industry.active}
        >
          Run just this
        </Button>
      )}
      <Button
        onClick={onDelete}
        variant="ghost"
        size="sm"
        className="text-red-600 hover:bg-transparent hover:text-red-700"
      >
        Delete
      </Button>
    </div>
  );
}

function RunStatusPill({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: "bg-gray-100 text-gray-700",
    running: "bg-blue-100 text-blue-700",
    completed: "bg-green-100 text-green-700",
    failed: "bg-red-100 text-red-700",
  };
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-medium ${styles[status] ?? styles.pending}`}
    >
      {status}
    </span>
  );
}
