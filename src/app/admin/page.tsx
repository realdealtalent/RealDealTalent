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
        <h1 className="text-xl font-bold text-gray-900">
          Real Deal Talent — Pipeline
        </h1>
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
