"use client";

import { useState } from "react";
import { Button } from "@/components/button";
import { tokens } from "@/components/design-tokens";

type Props = {
  onClose: () => void;
  onCreated: () => void;
};

export default function AddCompanyModal({ onClose, onCreated }: Props) {
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const form = new FormData(e.currentTarget);

    const body = {
      name: form.get("name") as string,
      domain: form.get("domain") as string,
      hqCountry: (form.get("hqCountry") as string) || undefined,
      hqState: (form.get("hqState") as string) || undefined,
      employeeBand: (form.get("employeeBand") as string) || undefined,
      industry: (form.get("industry") as string)
        ? (form.get("industry") as string).split(",").map((s) => s.trim())
        : undefined,
      linkedinUrl: (form.get("linkedinUrl") as string) || undefined,
      source: (form.get("source") as string) || undefined,
    };

    const res = await fetch("/api/companies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to create company");
      setSubmitting(false);
      return;
    }

    onCreated();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Add Company</h2>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="min-h-0 px-2 py-1 text-xl leading-none text-gray-400 hover:bg-transparent hover:text-gray-600"
          >
            &times;
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company Name *
            </label>
            <input
              name="name"
              required
              className={tokens.input.base}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Domain *
            </label>
            <input
              name="domain"
              required
              placeholder="example.com"
              className={tokens.input.base}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                HQ Country
              </label>
              <input
                name="hqCountry"
                className={tokens.input.base}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                HQ State
              </label>
              <input
                name="hqState"
                className={tokens.input.base}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Employee Band
            </label>
            <select
              name="employeeBand"
              className={tokens.input.base}
            >
              <option value="">Select…</option>
              <option value="<25">&lt;25</option>
              <option value="25-100">25-100</option>
              <option value="100-300">100-300</option>
              <option value="300+">300+</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Industry
            </label>
            <input
              name="industry"
              placeholder="Manufacturing, Logistics"
              className={tokens.input.base}
            />
            <p className="text-xs text-gray-400 mt-1">Comma-separated</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              LinkedIn URL
            </label>
            <input
              name="linkedinUrl"
              className={tokens.input.base}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Source
            </label>
            <select
              name="source"
              className={tokens.input.base}
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

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              onClick={onClose}
              variant="secondary"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={submitting}
            >
              Create Company
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
