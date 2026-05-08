"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AddCompanyModal from "./add-company-modal";

const PIPELINE_STATUSES = [
  { key: "prospect", label: "Prospect" },
  { key: "qualified", label: "Qualified" },
  { key: "outreach", label: "Outreach" },
  { key: "cooldown", label: "Cooldown" },
  { key: "lead", label: "Lead" },
  { key: "hot_lead", label: "Hot Lead" },
  { key: "meeting_booked", label: "Meeting Booked" },
  { key: "meeting_held", label: "Meeting Held" },
  { key: "proposal_sent", label: "Proposal Sent" },
  { key: "signed", label: "Signed" },
  { key: "rejected", label: "Rejected" },
] as const;

type Company = {
  id: string;
  name: string;
  domain: string;
  employeeBand: string | null;
  currentScore: number;
  status: string;
};

export default function PipelineBoard() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const router = useRouter();

  const fetchCompanies = async () => {
    const res = await fetch("/api/companies");
    if (res.ok) {
      setCompanies(await res.json());
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const grouped = PIPELINE_STATUSES.map((s) => ({
    ...s,
    companies: companies.filter((c) => c.status === s.key),
  }));

  return (
    <main className="h-screen flex flex-col">
      <header className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
        <h1 className="text-xl font-bold text-gray-900">
          Real Deal Talent — Pipeline
        </h1>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/settings"
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Settings
          </Link>
          <button
            onClick={() => setShowAddModal(true)}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            + Add Company
          </button>
        </div>
      </header>

      {loading ? (
        <div className="flex-1 flex items-center justify-center text-gray-500">
          Loading…
        </div>
      ) : (
        <div className="flex-1 overflow-x-auto">
          <div className="flex gap-4 p-4 h-full min-w-max">
            {grouped.map((col) => (
              <div
                key={col.key}
                className="w-64 shrink-0 flex flex-col bg-gray-100 rounded-lg"
              >
                <div className="px-3 py-2 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-gray-700">
                      {col.label}
                    </h2>
                    <span className="text-xs text-gray-400 bg-gray-200 rounded-full px-2 py-0.5">
                      {col.companies.length}
                    </span>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                  {col.companies.length === 0 ? (
                    <p className="text-xs text-gray-400 text-center py-4">
                      No companies
                    </p>
                  ) : (
                    col.companies.map((company) => (
                      <button
                        key={company.id}
                        onClick={() =>
                          router.push(`/admin/companies/${company.id}`)
                        }
                        className="w-full text-left bg-white rounded-md border border-gray-200 p-3 hover:shadow-md transition-shadow cursor-pointer"
                      >
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {company.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {company.domain}
                        </p>
                        <div className="mt-2 flex items-center justify-between">
                          {company.employeeBand && (
                            <span className="text-xs text-gray-400">
                              {company.employeeBand}
                            </span>
                          )}
                          <span className="text-xs font-mono text-blue-600">
                            {company.currentScore} pts
                          </span>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showAddModal && (
        <AddCompanyModal
          onClose={() => setShowAddModal(false)}
          onCreated={() => {
            setShowAddModal(false);
            fetchCompanies();
          }}
        />
      )}
    </main>
  );
}
