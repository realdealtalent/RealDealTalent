"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { SignalType } from "@/db/schema";
import { SIGNAL_LABELS, SIGNAL_TYPES } from "@/lib/pipeline-vocab";

const GEOGRAPHY_OPTIONS = [
  "US", "CA", "GB", "AU", "DE", "FR", "NL", "IE", "SG", "IN",
];

type LostReason = {
  id: string;
  label: string;
  slug: string;
  active: boolean;
  sortOrder: number;
};

type Filters = {
  headcount_min: number;
  headcount_max: number;
  geography: string[];
};

type ScoringConfig = {
  weights: Record<string, number>;
  threshold: number;
};

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  // Filters state
  const [filters, setFilters] = useState<Filters>({
    headcount_min: 25,
    headcount_max: 300,
    geography: ["US", "CA"],
  });
  const [filtersSaving, setFiltersSaving] = useState(false);
  const [filtersMessage, setFiltersMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Scoring state
  const [scoring, setScoring] = useState<ScoringConfig>({
    weights: {},
    threshold: 50,
  });
  const [scoringSaving, setScoringSaving] = useState(false);
  const [scoringMessage, setScoringMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Lost reasons state
  const [lostReasons, setLostReasons] = useState<LostReason[]>([]);
  const [reasonsMessage, setReasonsMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [newReasonLabel, setNewReasonLabel] = useState("");
  const [newReasonSlug, setNewReasonSlug] = useState("");
  const [addingReason, setAddingReason] = useState(false);

  const fetchAll = useCallback(async () => {
    const [filtersRes, scoringRes, reasonsRes] = await Promise.all([
      fetch("/api/config/filters"),
      fetch("/api/config/scoring"),
      fetch("/api/config/lost-reasons"),
    ]);

    if (filtersRes.ok) setFilters(await filtersRes.json());
    if (scoringRes.ok) setScoring(await scoringRes.json());
    if (reasonsRes.ok) setLostReasons(await reasonsRes.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // --- Filters handlers ---

  const saveFilters = async () => {
    setFiltersSaving(true);
    setFiltersMessage(null);

    const res = await fetch("/api/config/filters", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(filters),
    });

    if (!res.ok) {
      const data = await res.json();
      setFiltersMessage({ type: "error", text: data.error || "Failed to save" });
    } else {
      const data = await res.json();
      setFiltersMessage({
        type: "success",
        text: `Saved. Recompute: ${data.recompute.advanced} advanced, ${data.recompute.reverted} reverted (${data.recompute.total} companies).`,
      });
    }
    setFiltersSaving(false);
  };

  const toggleGeography = (code: string) => {
    setFilters((prev) => ({
      ...prev,
      geography: prev.geography.includes(code)
        ? prev.geography.filter((g) => g !== code)
        : [...prev.geography, code],
    }));
  };

  // --- Scoring handlers ---

  const saveScoring = async () => {
    setScoringSaving(true);
    setScoringMessage(null);

    const res = await fetch("/api/config/scoring", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(scoring),
    });

    if (!res.ok) {
      const data = await res.json();
      setScoringMessage({ type: "error", text: data.error || "Failed to save" });
    } else {
      const data = await res.json();
      setScoringMessage({
        type: "success",
        text: `Saved. Recompute: ${data.recompute.advanced} advanced, ${data.recompute.reverted} reverted (${data.recompute.total} companies).`,
      });
    }
    setScoringSaving(false);
  };

  const setWeight = (signalType: SignalType, value: number) => {
    setScoring((prev) => ({
      ...prev,
      weights: { ...prev.weights, [signalType]: value },
    }));
  };

  const toggleSignal = (signalType: SignalType) => {
    setScoring((prev) => ({
      ...prev,
      weights: {
        ...prev.weights,
        [signalType]: prev.weights[signalType] > 0 ? 0 : 10,
      },
    }));
  };

  // --- Lost reasons handlers ---

  const addReason = async () => {
    if (!newReasonLabel || !newReasonSlug) return;
    setAddingReason(true);
    setReasonsMessage(null);

    const res = await fetch("/api/config/lost-reasons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label: newReasonLabel, slug: newReasonSlug }),
    });

    if (!res.ok) {
      const data = await res.json();
      setReasonsMessage({ type: "error", text: data.error || "Failed to add" });
    } else {
      const reason = await res.json();
      setLostReasons((prev) => [...prev, reason]);
      setNewReasonLabel("");
      setNewReasonSlug("");
      setReasonsMessage({ type: "success", text: "Reason added" });
    }
    setAddingReason(false);
  };

  const updateReason = async (id: string, updates: Partial<LostReason>) => {
    setReasonsMessage(null);

    const res = await fetch(`/api/config/lost-reasons/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });

    if (!res.ok) {
      const data = await res.json();
      setReasonsMessage({ type: "error", text: data.error || "Failed to update" });
      return;
    }

    const updated = await res.json();
    setLostReasons((prev) => prev.map((r) => (r.id === id ? updated : r)));
  };

  const moveReason = async (id: string, direction: "up" | "down") => {
    const idx = lostReasons.findIndex((r) => r.id === id);
    if (idx === -1) return;
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= lostReasons.length) return;

    const current = lostReasons[idx];
    const swap = lostReasons[swapIdx];

    await Promise.all([
      updateReason(current.id, { sortOrder: swap.sortOrder }),
      updateReason(swap.id, { sortOrder: current.sortOrder }),
    ]);

    // Re-sort locally
    setLostReasons((prev) => {
      const copy = [...prev];
      copy[idx] = { ...swap, sortOrder: current.sortOrder };
      copy[swapIdx] = { ...current, sortOrder: swap.sortOrder };
      return copy.sort((a, b) => a.sortOrder - b.sortOrder);
    });
  };

  if (loading) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-12 text-gray-500">
        Loading…
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <button
        onClick={() => router.push("/admin")}
        className="text-sm text-blue-600 hover:underline mb-6 inline-block"
      >
        &larr; Back to Pipeline
      </button>

      <h1 className="text-2xl font-bold text-gray-900 mb-8">Settings</h1>

      {/* Hard Filters */}
      <section className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Hard Filters</h2>
        <p className="text-sm text-gray-500 mb-4">
          Companies must pass all hard filters to be eligible for qualification.
        </p>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Headcount Min
            </label>
            <input
              type="number"
              value={filters.headcount_min}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, headcount_min: Number(e.target.value) }))
              }
              min={0}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Headcount Max
            </label>
            <input
              type="number"
              value={filters.headcount_max}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, headcount_max: Number(e.target.value) }))
              }
              min={0}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Geography (allowed countries)
          </label>
          <div className="flex flex-wrap gap-2">
            {GEOGRAPHY_OPTIONS.map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => toggleGeography(code)}
                className={`rounded-md px-3 py-1.5 text-sm font-medium border ${
                  filters.geography.includes(code)
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                {code}
              </button>
            ))}
          </div>
        </div>

        {filtersMessage && (
          <Message type={filtersMessage.type} text={filtersMessage.text} />
        )}

        <div className="flex justify-end">
          <button
            onClick={saveFilters}
            disabled={filtersSaving}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {filtersSaving ? "Saving…" : "Save Filters"}
          </button>
        </div>
      </section>

      {/* Scoring */}
      <section className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Scoring Weights</h2>
        <p className="text-sm text-gray-500 mb-4">
          Each signal type contributes its weight to a company's score. Companies meeting the threshold auto-advance to Qualified.
        </p>

        <div className="space-y-3 mb-6">
          {SIGNAL_TYPES.map((signal) => {
            const weight = scoring.weights[signal] ?? 0;
            const enabled = weight > 0;

            return (
              <div key={signal} className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => toggleSignal(signal)}
                  className={`w-10 h-6 rounded-full relative transition-colors ${
                    enabled ? "bg-blue-600" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                      enabled ? "left-4" : "left-0.5"
                    }`}
                  />
                </button>
                <span className="text-sm text-gray-700 w-44">{SIGNAL_LABELS[signal]}</span>
                <input
                  type="range"
                  min={0}
                  max={50}
                  value={weight}
                  onChange={(e) => setWeight(signal, Number(e.target.value))}
                  className="flex-1"
                />
                <span className="text-sm font-mono text-gray-600 w-8 text-right">
                  {weight}
                </span>
              </div>
            );
          })}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Qualification Threshold
          </label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={0}
              max={200}
              value={scoring.threshold}
              onChange={(e) =>
                setScoring((prev) => ({ ...prev, threshold: Number(e.target.value) }))
              }
              className="flex-1"
            />
            <input
              type="number"
              value={scoring.threshold}
              onChange={(e) =>
                setScoring((prev) => ({ ...prev, threshold: Number(e.target.value) }))
              }
              min={0}
              className="w-20 rounded-md border border-gray-300 px-3 py-2 text-sm font-mono"
            />
          </div>
        </div>

        {scoringMessage && (
          <Message type={scoringMessage.type} text={scoringMessage.text} />
        )}

        <div className="flex justify-end">
          <button
            onClick={saveScoring}
            disabled={scoringSaving}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {scoringSaving ? "Saving…" : "Save Scoring"}
          </button>
        </div>
      </section>

      {/* Lost Reasons */}
      <section className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Lost Reasons</h2>
        <p className="text-sm text-gray-500 mb-4">
          Manage rejection reasons. Deactivated reasons are hidden from the rejection modal but preserved on existing companies.
        </p>

        <div className="space-y-2 mb-4">
          {lostReasons.map((reason, idx) => (
            <LostReasonRow
              key={reason.id}
              reason={reason}
              isFirst={idx === 0}
              isLast={idx === lostReasons.length - 1}
              onUpdate={(updates) => updateReason(reason.id, updates)}
              onMove={(dir) => moveReason(reason.id, dir)}
            />
          ))}
          {lostReasons.length === 0 && (
            <p className="text-sm text-gray-500">No lost reasons configured.</p>
          )}
        </div>

        {reasonsMessage && (
          <Message type={reasonsMessage.type} text={reasonsMessage.text} />
        )}

        <div className="border-t border-gray-200 pt-4 mt-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Add New Reason</h3>
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1">Label</label>
              <input
                value={newReasonLabel}
                onChange={(e) => {
                  setNewReasonLabel(e.target.value);
                  if (!newReasonSlug || newReasonSlug === slugify(newReasonLabel)) {
                    setNewReasonSlug(slugify(e.target.value));
                  }
                }}
                placeholder="e.g. Acquired by competitor"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1">Slug</label>
              <input
                value={newReasonSlug}
                onChange={(e) => setNewReasonSlug(e.target.value)}
                placeholder="e.g. acquired_by_competitor"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm font-mono"
              />
            </div>
            <button
              onClick={addReason}
              disabled={addingReason || !newReasonLabel || !newReasonSlug}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {addingReason ? "Adding…" : "Add"}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}

function LostReasonRow({
  reason,
  isFirst,
  isLast,
  onUpdate,
  onMove,
}: {
  reason: LostReason;
  isFirst: boolean;
  isLast: boolean;
  onUpdate: (updates: Partial<LostReason>) => void;
  onMove: (direction: "up" | "down") => void;
}) {
  const [editing, setEditing] = useState(false);
  const [label, setLabel] = useState(reason.label);
  const [slug, setSlug] = useState(reason.slug);

  const save = () => {
    onUpdate({ label, slug });
    setEditing(false);
  };

  const cancel = () => {
    setLabel(reason.label);
    setSlug(reason.slug);
    setEditing(false);
  };

  return (
    <div
      className={`flex items-center gap-3 rounded-md border px-3 py-2 text-sm ${
        reason.active
          ? "border-gray-200 bg-white"
          : "border-gray-100 bg-gray-50 opacity-60"
      }`}
    >
      <div className="flex flex-col gap-0.5">
        <button
          type="button"
          onClick={() => onMove("up")}
          disabled={isFirst}
          className="text-xs text-gray-400 hover:text-gray-600 disabled:opacity-30"
        >
          ▲
        </button>
        <button
          type="button"
          onClick={() => onMove("down")}
          disabled={isLast}
          className="text-xs text-gray-400 hover:text-gray-600 disabled:opacity-30"
        >
          ▼
        </button>
      </div>

      {editing ? (
        <>
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="flex-1 rounded-md border border-gray-300 px-2 py-1 text-sm"
          />
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="w-40 rounded-md border border-gray-300 px-2 py-1 text-sm font-mono"
          />
          <button
            onClick={save}
            className="text-xs text-blue-600 hover:underline"
          >
            Save
          </button>
          <button
            onClick={cancel}
            className="text-xs text-gray-500 hover:underline"
          >
            Cancel
          </button>
        </>
      ) : (
        <>
          <span className="flex-1 text-gray-900">{reason.label}</span>
          <span className="text-xs font-mono text-gray-400">{reason.slug}</span>
          <button
            onClick={() => setEditing(true)}
            className="text-xs text-blue-600 hover:underline"
          >
            Edit
          </button>
        </>
      )}

      <button
        type="button"
        onClick={() => onUpdate({ active: !reason.active })}
        className={`text-xs ${reason.active ? "text-red-600 hover:underline" : "text-green-600 hover:underline"}`}
      >
        {reason.active ? "Deactivate" : "Activate"}
      </button>
    </div>
  );
}

function Message({ type, text }: { type: "success" | "error"; text: string }) {
  return (
    <div
      className={`mb-4 rounded-md border px-4 py-3 text-sm ${
        type === "success"
          ? "bg-green-50 border-green-200 text-green-700"
          : "bg-red-50 border-red-200 text-red-700"
      }`}
    >
      {text}
    </div>
  );
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
}
