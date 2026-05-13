"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { CompanyStatus } from "@/db/schema";
import { Button } from "@/components/button";
import { tokens } from "@/components/design-tokens";
import { Pill } from "@/components/pill";
import { Skeleton } from "@/components/skeleton";
import { STATUSES } from "@/lib/pipeline-vocab";
import AddCompanyModal from "./add-company-modal";
import ProspectingSettingsModal from "./prospecting-settings-modal";

type Company = {
  id: string;
  name: string;
  domain: string;
  employeeBand: string | null;
  currentScore: number;
  status: CompanyStatus;
};

export default function PipelineBoard() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showProspectingSettings, setShowProspectingSettings] = useState(false);
  const [runningProspecting, setRunningProspecting] = useState(false);
  const [prospectingToast, setProspectingToast] = useState<string | null>(null);

  const runProspecting = async () => {
    setRunningProspecting(true);
    setProspectingToast(null);
    const res = await fetch("/api/prospecting/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    setRunningProspecting(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setProspectingToast(data.error || "Failed to start prospecting run");
      return;
    }
    setProspectingToast(
      "Prospecting run started — new prospects will appear here as the workflow completes.",
    );
  };

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

  const grouped = STATUSES.map((status) => ({
    status,
    companies: companies.filter((c) => c.status === status),
  }));

  return (
    <main className="h-screen flex flex-col">
      <header className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
        <Link
          href="/admin/login"
          className="flex items-center gap-2 text-gray-900 hover:opacity-75 transition-opacity"
        >
          <svg
            className="h-6 w-6 shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          <h1 className="text-xl font-bold">Real Deal Talent — Pipeline</h1>
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/settings"
            className={`${tokens.button.base} ${tokens.button.secondary} min-h-11 px-4 py-2 text-sm`}
          >
            Settings
          </Link>
          <Button
            onClick={() => setShowAddModal(true)}
          >
            + Add Company
          </Button>
        </div>
      </header>

      {loading ? (
        <PipelineBoardSkeleton />
      ) : (
        <div className="flex-1 overflow-x-auto">
          <div className="flex gap-4 p-4 h-full min-w-max">
            {grouped.map((col) => (
              <div
                key={col.status}
                className="w-64 shrink-0 flex flex-col bg-gray-100 rounded-lg"
              >
                <div className="px-3 py-2 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <Pill stage={col.status} />
                    <span className="text-xs text-gray-400 bg-gray-200 rounded-full px-2 py-0.5">
                      {col.companies.length}
                    </span>
                  </div>
                  {col.status === "prospect" && (
                    <div className="mt-2 flex items-center gap-2">
                      <Button
                        onClick={runProspecting}
                        loading={runningProspecting}
                        size="sm"
                        className="flex-1 min-h-9"
                      >
                        Run Prospecting
                      </Button>
                      <Button
                        onClick={() => setShowProspectingSettings(true)}
                        variant="secondary"
                        size="sm"
                        aria-label="Prospecting settings"
                        className="min-h-9 px-2"
                      >
                        <svg
                          className="h-4 w-4"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <circle cx="12" cy="12" r="3" />
                          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                        </svg>
                      </Button>
                    </div>
                  )}
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                  {col.companies.length === 0 ? (
                    <p className="text-xs text-gray-400 text-center py-4">
                      No companies
                    </p>
                  ) : (
                    col.companies.map((company) => (
                      <Link
                        key={company.id}
                        href={`/admin/companies/${company.id}`}
                        className="block h-auto w-full rounded-md border border-gray-200 bg-white p-3 text-left transition-shadow hover:bg-white hover:shadow-md"
                      >
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {company.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {company.domain}
                        </p>
                        <div className="mt-2">
                          <Pill stage={company.status} className="px-2 py-0.5" />
                        </div>
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
                      </Link>
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

      {showProspectingSettings && (
        <ProspectingSettingsModal
          onClose={() => setShowProspectingSettings(false)}
        />
      )}

      {prospectingToast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm rounded-md border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800 shadow-lg">
          <div className="flex items-start gap-3">
            <p className="flex-1">{prospectingToast}</p>
            <button
              type="button"
              onClick={() => setProspectingToast(null)}
              className="text-blue-500 hover:text-blue-700"
              aria-label="Dismiss"
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

function PipelineBoardSkeleton() {
  return (
    <div className="flex-1 overflow-x-auto">
      <div className="flex h-full min-w-max gap-4 p-4">
        {STATUSES.map((status) => (
          <div
            key={status}
            className="flex w-64 shrink-0 flex-col rounded-lg bg-gray-100"
          >
            <div className="border-b border-gray-200 px-3 py-2">
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-24 rounded-full" />
                <Skeleton className="h-5 w-7 rounded-full" />
              </div>
            </div>
            <div className="flex-1 space-y-2 overflow-y-auto p-2">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={`${status}-${index}`}
                  className="rounded-md border border-gray-200 bg-white p-3"
                >
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="mt-2 h-3 w-1/2" />
                  <Skeleton className="mt-3 h-5 w-20 rounded-full" />
                  <div className="mt-3 flex items-center justify-between">
                    <Skeleton className="h-3 w-14" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
