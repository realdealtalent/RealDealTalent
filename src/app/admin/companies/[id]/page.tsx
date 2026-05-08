"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

const STATUSES = [
  "prospect",
  "qualified",
  "outreach",
  "cooldown",
  "lead",
  "hot_lead",
  "meeting_booked",
  "meeting_held",
  "proposal_sent",
  "signed",
  "rejected",
];

const STATUS_LABELS: Record<string, string> = {
  prospect: "Prospect",
  qualified: "Qualified",
  outreach: "Outreach",
  cooldown: "Cooldown",
  lead: "Lead",
  hot_lead: "Hot Lead",
  meeting_booked: "Meeting Booked",
  meeting_held: "Meeting Held",
  proposal_sent: "Proposal Sent",
  signed: "Signed",
  rejected: "Rejected",
};

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
  status: string;
  statusChangedAt: string | null;
  cooldownUntil: string | null;
  lostReason: string | null;
  lostNote: string | null;
  source: string | null;
  owner: string | null;
  createdAt: string;
  updatedAt: string;
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

  useEffect(() => {
    fetch(`/api/companies/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then(setCompany)
      .catch(() => setCompany(null))
      .finally(() => setLoading(false));
  }, [id]);

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
      status: form.get("status") as string,
    };

    // Include lost reason/note if status is rejected
    if (body.status === "rejected") {
      body.lostReason = (form.get("lostReason") as string) || null;
      body.lostNote = (form.get("lostNote") as string) || null;
    }

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
          <span className="inline-block rounded-full bg-blue-100 text-blue-800 text-xs font-medium px-3 py-1">
            {STATUS_LABELS[company.status] || company.status}
          </span>
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
              value={STATUS_LABELS[company.status] || company.status}
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                name="status"
                defaultValue={company.status}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Lost Reason"
              name="lostReason"
              defaultValue={company.lostReason ?? ""}
            />
            <FormField
              label="Lost Note"
              name="lostNote"
              defaultValue={company.lostNote ?? ""}
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
    </main>
  );
}

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <dt className="text-gray-500">{label}</dt>
      <dd className="text-gray-900 mt-0.5">{value || "—"}</dd>
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
