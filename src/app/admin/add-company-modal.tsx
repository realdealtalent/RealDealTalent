"use client";

import { useState } from "react";
import { Button } from "@/components/button";
import { FormField, FormMessage, Input, Select } from "@/components/forms";

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
            aria-label="Close add company modal"
            className="min-h-0 px-2 py-1 text-xl leading-none text-gray-400 hover:bg-transparent hover:text-gray-600"
          >
            &times;
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <FormMessage type="error">
              {error}
            </FormMessage>
          )}

          <FormField label="Company Name *" htmlFor="company-name">
            <Input id="company-name" name="name" required />
          </FormField>

          <FormField label="Domain *" htmlFor="company-domain">
            <Input
              id="company-domain"
              name="domain"
              required
              placeholder="example.com"
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="HQ Country" htmlFor="company-hq-country">
              <Input id="company-hq-country" name="hqCountry" />
            </FormField>
            <FormField label="HQ State" htmlFor="company-hq-state">
              <Input id="company-hq-state" name="hqState" />
            </FormField>
          </div>

          <FormField label="Employee Band" htmlFor="company-employee-band">
            <Select id="company-employee-band" name="employeeBand">
              <option value="">Select…</option>
              <option value="<25">&lt;25</option>
              <option value="25-100">25-100</option>
              <option value="100-300">100-300</option>
              <option value="300+">300+</option>
            </Select>
          </FormField>

          <FormField label="Industry" htmlFor="company-industry">
            <Input
              id="company-industry"
              name="industry"
              placeholder="Manufacturing, Logistics"
            />
            <p className="text-xs text-gray-400 mt-1">Comma-separated</p>
          </FormField>

          <FormField label="LinkedIn URL" htmlFor="company-linkedin-url">
            <Input id="company-linkedin-url" name="linkedinUrl" />
          </FormField>

          <FormField label="Source" htmlFor="company-source">
            <Select id="company-source" name="source">
              <option value="">Select…</option>
              <option value="manual">Manual</option>
              <option value="event_scrape">Event Scrape</option>
              <option value="zoominfo_search">ZoomInfo Search</option>
              <option value="linkedin">LinkedIn</option>
              <option value="csv">CSV Import</option>
              <option value="referral">Referral</option>
            </Select>
          </FormField>

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
