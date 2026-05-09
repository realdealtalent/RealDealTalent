"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { CompanyStatus } from "@/db/schema";
import { Button } from "@/components/button";
import { tokens } from "@/components/design-tokens";
import { Pill } from "@/components/pill";
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
        <div className="flex-1 flex items-center justify-center text-gray-500">
          Loading…
        </div>
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
                      <Button
                        key={company.id}
                        onClick={() =>
                          router.push(`/admin/companies/${company.id}`)
                        }
                        variant="ghost"
                        size="sm"
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
                      </Button>
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
