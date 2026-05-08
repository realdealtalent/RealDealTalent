// v0 schema — Company pipeline tables only.
// Contacts, Spec Sheets, Accounts, Engagements, Roles, Candidates,
// Candidacies, Placements, Feed Items, Events, Job Postings deferred to v1.

import {
  pgTable,
  uuid,
  text,
  integer,
  timestamp,
  jsonb,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const companyStatus = [
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
] as const;

export type CompanyStatus = (typeof companyStatus)[number];

export const companies = pgTable(
  "companies",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    domain: text("domain").notNull(),
    hqCountry: text("hq_country"),
    hqState: text("hq_state"),
    employeeCount: integer("employee_count"),
    employeeBand: text("employee_band"),
    industry: text("industry").array(),
    revenueBand: text("revenue_band"),
    linkedinUrl: text("linkedin_url"),
    enrichmentSources: jsonb("enrichment_sources"),
    currentScore: integer("current_score").notNull().default(0),
    status: text("status").notNull().default("prospect"),
    statusChangedAt: timestamp("status_changed_at", { withTimezone: true }),
    cooldownUntil: timestamp("cooldown_until", { withTimezone: true }),
    lostReason: text("lost_reason"),
    lostNote: text("lost_note"),
    source: text("source"),
    accountId: uuid("account_id"),
    owner: text("owner"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [uniqueIndex("companies_domain_idx").on(table.domain)],
);

export type Company = typeof companies.$inferSelect;
export type NewCompany = typeof companies.$inferInsert;
