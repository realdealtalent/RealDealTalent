"use client";

import type { ReactNode } from "react";
import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import type { CompanyStatus, SignalType } from "@/db/schema";
import { Pill } from "@/components/pill";
import {
  SIGNAL_LABELS,
  SIGNAL_TYPES,
  STATUSES,
  STATUS_LABELS,
} from "@/lib/pipeline-vocab";

type Company = {
  id: string;
  name: string;
  domain: string;
  hqCountry: string | null;
  hqState: string | null;
  employeeCount: number | null;
  employeeBand: string | null;
  industry: string[] | null;
  revenueBand: string | null;
  linkedinUrl: string | null;
  currentScore: number;
  status: CompanyStatus;
  statusChangedAt: string | null;
  cooldownUntil: string | null;
  lostReason: string | null;
  lostNote: string | null;
  source: string | null;
  owner: string | null;
  createdAt: string;
  updatedAt: string;
  scoreBreakdown?: ScoreBreakdown;
};

type LostReason = {
  id: string;
  label: string;
  slug: string;
};

type HistoryEntry = {
  id: string;
  fromStage: CompanyStatus | null;
  toStage: CompanyStatus;
  changedAt: string;
  changedBy: string | null;
  note: string | null;
};

type ScoreBreakdown = {
  signals: Array<{
    id: string;
    signalType: SignalType;
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

export default function CompanyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Transition state
  const [transitioning, setTransitioning] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [lostReasons, setLostReasons] = useState<LostReason[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const fetchCompany = useCallback(async () => {
    const res = await fetch(`/api/companies/${id}`);
    if (res.ok) {
      setCompany(await res.json());
    } else {
      setCompany(null);
    }
  }, [id]);

  const fetchHistory = useCallback(async () => {
    const res = await fetch(`/api/companies/${id}/history`);
    if (res.ok) setHistory(await res.json());
  }, [id]);

  useEffect(() => {
    Promise.all([
      fetchCompany(),
      fetchHistory(),
      fetch("/api/lost-reasons")
        .then((r) => r.json())
        .then(setLostReasons)
        .catch(() => {}),
    ]).finally(() => setLoading(false));
  }, [id, fetchCompany, fetchHistory]);

  const handleTransition = async (
    newStatus: CompanyStatus,
    opts?: { lostReasonSlug?: string; note?: string },
  ) => {
    setError("");
    setSuccess("");
    setTransitioning(true);

    const res = await fetch(`/api/companies/${id}/transition`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus, ...opts }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Transition failed");
      setTransitioning(false);
      return;
    }

    const updated = await res.json();
    setCompany(updated);
    setSuccess(`Status changed to ${STATUS_LABELS[newStatus]}`);
    setTransitioning(false);
    fetchHistory();
    setTimeout(() => setSuccess(""), 3000);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    const form = new FormData(e.currentTarget);

    const body: Record<string, unknown> = {
      name: form.get("name") as string,
      domain: form.get("domain") as string,
      hqCountry: (form.get("hqCountry") as string) || null,
      hqState: (form.get("hqState") as string) || null,
      employeeCount: (form.get("employeeCount") as string)
        ? Number(form.get("employeeCount"))
        : null,
      employeeBand: (form.get("employeeBand") as string) || null,
      industry: (form.get("industry") as string)
        ? (form.get("industry") as string).split(",").map((s) => s.trim())
        : null,
      revenueBand: (form.get("revenueBand") as string) || null,
      linkedinUrl: (form.get("linkedinUrl") as string) || null,
      source: (form.get("source") as string) || null,
      owner: (form.get("owner") as string) || null,
    };

    const res = await fetch(`/api/companies/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to save");
      setSaving(false);
      return;
    }

    const updated = await res.json();
    setCompany(updated);
    setEditing(false);
    setSuccess("Company updated");
    setSaving(false);
    setTimeout(() => setSuccess(""), 3000);
  };

  const handleAddSignal = async (signalType: SignalType, source: string) => {
    setError("");
    setSuccess("");

    const res = await fetch(`/api/companies/${id}/signals`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ signalType, source: source || undefined }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to add signal");
      return;
    }

    const { company: updated } = await res.json();
    setCompany({ ...updated, scoreBreakdown: company?.scoreBreakdown });
    setSuccess("Signal added");
    // Refetch to get updated score breakdown
    fetchCompany();
    fetchHistory();
    setTimeout(() => setSuccess(""), 3000);
  };

  if (loading) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-12 text-gray-500">
        Loading…
      </main>
    );
  }

  if (!company) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-12">
        <p className="text-gray-500">Company not found.</p>
        <button
          onClick={() => router.push("/admin")}
          className="mt-4 text-sm text-blue-600 hover:underline"
        >
          Back to Pipeline
        </button>
      </main>
    );
  }

  // Determine valid next statuses for the transition controls
  const nextStatuses = getNextStatuses(company.status);

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <button
        onClick={() => router.push("/admin")}
        className="text-sm text-blue-600 hover:underline mb-6 inline-block"
      >
        &larr; Back to Pipeline
      </button>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{company.name}</h1>
          <p className="text-gray-500">{company.domain}</p>
        </div>
        <div className="flex items-center gap-3">
          <Pill stage={company.status} />
          <span className="text-sm font-mono text-blue-600">
            {company.currentScore} pts
          </span>
        </div>
      </div>

      {success && (
        <div className="mb-4 rounded-md bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
          {success}
        </div>
      )}
      {error && (
        <div className="mb-4 rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Status transition controls */}
      {!editing && (
        <div className="mb-6 bg-white rounded-lg border border-gray-200 p-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">
            Pipeline Actions
          </h2>
          <div className="flex flex-wrap gap-2">
            {company.status === "rejected" ? (
              <button
                onClick={() => handleTransition("qualified")}
                disabled={transitioning}
                className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
              >
                {transitioning ? "Reactivating…" : "Reactivate to Qualified"}
              </button>
            ) : (
              <>
                {nextStatuses
                  .filter((s) => s !== "rejected")
                  .map((s) => (
                    <button
                      key={s}
                      onClick={() => handleTransition(s)}
                      disabled={transitioning}
                      className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                      {transitioning ? "…" : STATUS_LABELS[s]}
                    </button>
                  ))}
                <button
                  onClick={() => setShowRejectModal(true)}
                  disabled={transitioning}
                  className="rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                >
                  Reject
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {!editing ? (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setEditing(true)}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              Edit
            </button>
          </div>

          <dl className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
            <Field label="Name" value={company.name} />
            <Field label="Domain" value={company.domain} />
            <Field label="HQ Country" value={company.hqCountry} />
            <Field label="HQ State" value={company.hqState} />
            <Field
              label="Employee Count"
              value={company.employeeCount?.toString()}
            />
            <Field label="Employee Band" value={company.employeeBand} />
            <Field
              label="Industry"
              value={company.industry?.join(", ")}
            />
            <Field label="Revenue Band" value={company.revenueBand} />
            <Field label="LinkedIn URL" value={company.linkedinUrl} />
            <Field label="Source" value={company.source} />
            <Field label="Owner" value={company.owner} />
            <Field
              label="Status"
              value={<Pill stage={company.status} />}
            />
            {company.status === "rejected" && (
              <>
                <Field label="Lost Reason" value={company.lostReason} />
                <Field label="Lost Note" value={company.lostNote} />
              </>
            )}
            <Field label="Score" value={company.currentScore.toString()} />
            <Field
              label="Created"
              value={new Date(company.createdAt).toLocaleDateString()}
            />
            <Field
              label="Updated"
              value={new Date(company.updatedAt).toLocaleDateString()}
            />
            {company.statusChangedAt && (
              <Field
                label="Status Changed"
                value={new Date(company.statusChangedAt).toLocaleDateString()}
              />
            )}
          </dl>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg border border-gray-200 p-6 space-y-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Name *" name="name" defaultValue={company.name} required />
            <FormField
              label="Domain *"
              name="domain"
              defaultValue={company.domain}
              required
            />
            <FormField
              label="HQ Country"
              name="hqCountry"
              defaultValue={company.hqCountry ?? ""}
            />
            <FormField
              label="HQ State"
              name="hqState"
              defaultValue={company.hqState ?? ""}
            />
            <FormField
              label="Employee Count"
              name="employeeCount"
              type="number"
              defaultValue={company.employeeCount?.toString() ?? ""}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Employee Band
              </label>
              <select
                name="employeeBand"
                defaultValue={company.employeeBand ?? ""}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="">Select…</option>
                <option value="<25">&lt;25</option>
                <option value="25-100">25-100</option>
                <option value="100-300">100-300</option>
                <option value="300+">300+</option>
              </select>
            </div>
            <FormField
              label="Industry"
              name="industry"
              defaultValue={company.industry?.join(", ") ?? ""}
              placeholder="Comma-separated"
            />
            <FormField
              label="Revenue Band"
              name="revenueBand"
              defaultValue={company.revenueBand ?? ""}
            />
            <FormField
              label="LinkedIn URL"
              name="linkedinUrl"
              defaultValue={company.linkedinUrl ?? ""}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Source
              </label>
              <select
                name="source"
                defaultValue={company.source ?? ""}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="">Select…</option>
                <option value="manual">Manual</option>
                <option value="event_scrape">Event Scrape</option>
                <option value="zoominfo_search">ZoomInfo Search</option>
                <option value="linkedin">LinkedIn</option>
                <option value="csv">CSV Import</option>
                <option value="referral">Referral</option>
              </select>
            </div>
            <FormField
              label="Owner"
              name="owner"
              defaultValue={company.owner ?? ""}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setEditing(false);
                setError("");
              }}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </form>
      )}

      {/* Why this score panel */}
      {!editing && company.scoreBreakdown && (
        <div className="mt-8 bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Why this score
          </h2>

          {/* Filter status */}
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Hard Filters</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className={`rounded-md px-3 py-2 ${company.scoreBreakdown.filterResults.headcount.pass ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                <span className="font-medium">Headcount:</span>{" "}
                {company.scoreBreakdown.filterResults.headcount.value ?? "not set"}{" "}
                (range: {company.scoreBreakdown.filterResults.headcount.min}–{company.scoreBreakdown.filterResults.headcount.max})
                {" "}{company.scoreBreakdown.filterResults.headcount.pass ? "PASS" : "FAIL"}
              </div>
              <div className={`rounded-md px-3 py-2 ${company.scoreBreakdown.filterResults.geography.pass ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                <span className="font-medium">Geography:</span>{" "}
                {company.scoreBreakdown.filterResults.geography.value ?? "not set"}{" "}
                (allowed: {company.scoreBreakdown.filterResults.geography.allowed.join(", ")})
                {" "}{company.scoreBreakdown.filterResults.geography.pass ? "PASS" : "FAIL"}
              </div>
            </div>
          </div>

          {/* Score breakdown */}
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Signal Breakdown</h3>
            {company.scoreBreakdown.signals.length === 0 ? (
              <p className="text-sm text-gray-500">No signals recorded yet.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left text-gray-500">
                    <th className="pb-2 font-medium">Signal</th>
                    <th className="pb-2 font-medium">Points</th>
                    <th className="pb-2 font-medium">Source</th>
                    <th className="pb-2 font-medium">Observed</th>
                  </tr>
                </thead>
                <tbody>
                  {company.scoreBreakdown.signals.map((s) => (
                    <tr key={s.id} className="border-b border-gray-100">
                      <td className="py-2 text-gray-900">{SIGNAL_LABELS[s.signalType]}</td>
                      <td className="py-2 font-mono text-blue-600">+{s.points}</td>
                      <td className="py-2 text-gray-500">{s.source || "—"}</td>
                      <td className="py-2 text-gray-400 text-xs">{new Date(s.observedAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Threshold */}
          <div className="flex items-center gap-4 text-sm rounded-md bg-gray-50 px-4 py-3">
            <span>
              <span className="font-medium text-gray-700">Total Score:</span>{" "}
              <span className="font-mono text-blue-600">{company.scoreBreakdown.totalScore}</span>
            </span>
            <span className="text-gray-300">|</span>
            <span>
              <span className="font-medium text-gray-700">Threshold:</span>{" "}
              <span className="font-mono">{company.scoreBreakdown.threshold}</span>
            </span>
            <span className="text-gray-300">|</span>
            <span className={company.scoreBreakdown.qualifies ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
              {company.scoreBreakdown.qualifies ? "Qualifies" : "Does not qualify"}
            </span>
          </div>
        </div>
      )}

      {/* Add Signal form */}
      {!editing && (
        <AddSignalForm onAdd={handleAddSignal} />
      )}

      {/* Stage History Timeline */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Stage History
        </h2>
        {history.length === 0 ? (
          <p className="text-sm text-gray-500">No transitions recorded yet.</p>
        ) : (
          <div className="space-y-3">
            {history.map((entry) => (
              <div
                key={entry.id}
                className="bg-white rounded-lg border border-gray-200 px-4 py-3 text-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">
                      {entry.fromStage
                        ? STATUS_LABELS[entry.fromStage]
                        : "—"}
                    </span>
                    <span className="text-gray-400">&rarr;</span>
                    <Pill stage={entry.toStage} className="px-2 py-0.5" />
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(entry.changedAt).toLocaleString()}
                  </span>
                </div>
                {entry.note && (
                  <p className="mt-1 text-gray-600">{entry.note}</p>
                )}
                {entry.changedBy && (
                  <p className="mt-1 text-xs text-gray-400">
                    by {entry.changedBy}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Rejection Modal */}
      {showRejectModal && (
        <RejectModal
          lostReasons={lostReasons}
          onConfirm={(slug, note) => {
            setShowRejectModal(false);
            handleTransition("rejected", { lostReasonSlug: slug, note });
          }}
          onCancel={() => setShowRejectModal(false)}
        />
      )}
    </main>
  );
}

/** Determine valid next statuses based on current status. */
function getNextStatuses(current: CompanyStatus): CompanyStatus[] {
  // All statuses except the current one are valid transition targets.
  // Special cases handled by the backend validation:
  //   - rejected requires lost reason
  //   - from rejected, only qualified is allowed
  if (current === "rejected") return ["qualified"];
  return STATUSES.filter((s) => s !== current);
}

function RejectModal({
  lostReasons,
  onConfirm,
  onCancel,
}: {
  lostReasons: LostReason[];
  onConfirm: (slug: string, note?: string) => void;
  onCancel: () => void;
}) {
  const [selectedSlug, setSelectedSlug] = useState("");
  const [note, setNote] = useState("");
  const requiresNote = selectedSlug === "other_with_note";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Reject Company
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lost Reason *
            </label>
            <select
              value={selectedSlug}
              onChange={(e) => setSelectedSlug(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="">Select a reason…</option>
              {lostReasons.map((r) => (
                <option key={r.slug} value={r.slug}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Note {requiresNote && "*"}
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              placeholder={
                requiresNote ? "Required for this reason" : "Optional"
              }
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={
              !selectedSlug || (requiresNote && !note.trim())
            }
            onClick={() => onConfirm(selectedSlug, note || undefined)}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  );
}

function AddSignalForm({
  onAdd,
}: {
  onAdd: (signalType: SignalType, source: string) => void;
}) {
  const [signalType, setSignalType] = useState<SignalType | "">("");
  const [source, setSource] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signalType) return;
    setSubmitting(true);
    await onAdd(signalType, source);
    setSignalType("");
    setSource("");
    setSubmitting(false);
  };

  return (
    <div className="mt-6 bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Add Signal</h2>
      <form onSubmit={handleSubmit} className="flex items-end gap-3">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Signal Type *
          </label>
          <select
            value={signalType}
            onChange={(e) => setSignalType(e.target.value as SignalType | "")}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="">Select signal…</option>
            {SIGNAL_TYPES.map((s) => (
              <option key={s} value={s}>
                {SIGNAL_LABELS[s]}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Source
          </label>
          <input
            value={source}
            onChange={(e) => setSource(e.target.value)}
            placeholder="e.g. LinkedIn, ZoomInfo"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={signalType === "" || submitting}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {submitting ? "Adding…" : "Add"}
        </button>
      </form>
    </div>
  );
}

function Field({
  label,
  value,
}: {
  label: string;
  value?: ReactNode;
}) {
  return (
    <div>
      <dt className="text-gray-500">{label}</dt>
      <dd className="text-gray-900 mt-0.5">{value ?? "—"}</dd>
    </div>
  );
}

function FormField({
  label,
  name,
  defaultValue,
  type = "text",
  required,
  placeholder,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
      />
    </div>
  );
}
