import type { CompanyStatus, SignalType } from "@/db/schema";

export const STATUSES = [
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
] as const satisfies readonly CompanyStatus[];

export const STATUS_LABELS: Record<CompanyStatus, string> = {
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

export const STATUS_COLORS: Record<CompanyStatus, string> = {
  prospect: "bg-slate-100 text-slate-800 ring-slate-200",
  qualified: "bg-emerald-100 text-emerald-800 ring-emerald-200",
  outreach: "bg-sky-100 text-sky-800 ring-sky-200",
  cooldown: "bg-amber-100 text-amber-800 ring-amber-200",
  lead: "bg-violet-100 text-violet-800 ring-violet-200",
  hot_lead: "bg-rose-100 text-rose-800 ring-rose-200",
  meeting_booked: "bg-orange-100 text-orange-800 ring-orange-200",
  meeting_held: "bg-cyan-100 text-cyan-800 ring-cyan-200",
  proposal_sent: "bg-indigo-100 text-indigo-800 ring-indigo-200",
  signed: "bg-lime-100 text-lime-800 ring-lime-200",
  rejected: "bg-red-100 text-red-800 ring-red-200",
};

export const SIGNAL_TYPES = [
  "open_sales_role",
  "open_ops_role",
  "recent_funding",
  "leadership_change",
  "pe_owned",
  "multi_site_expansion",
  "certification_added",
  "event_exhibitor",
] as const satisfies readonly SignalType[];

export const SIGNAL_LABELS: Record<SignalType, string> = {
  open_sales_role: "Open Sales Role",
  open_ops_role: "Open Ops Role",
  recent_funding: "Recent Funding",
  leadership_change: "Leadership Change",
  pe_owned: "PE Owned",
  multi_site_expansion: "Multi-Site Expansion",
  certification_added: "Certification Added",
  event_exhibitor: "Event Exhibitor",
};
