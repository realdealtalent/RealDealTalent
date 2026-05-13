// v0 schema — Company pipeline tables only.
// Contacts, Spec Sheets, Accounts, Engagements, Roles, Candidates,
// Candidacies, Placements, Feed Items, Events, Job Postings deferred to v1.

import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
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

export const lostReasons = pgTable("lost_reasons", {
  id: uuid("id").defaultRandom().primaryKey(),
  label: text("label").notNull(),
  slug: text("slug").notNull().unique(),
  active: boolean("active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
});

export type LostReason = typeof lostReasons.$inferSelect;

export const stageHistory = pgTable("stage_history", {
  id: uuid("id").defaultRandom().primaryKey(),
  entityType: text("entity_type").notNull().default("company"),
  entityId: uuid("entity_id").notNull(),
  fromStage: text("from_stage"),
  toStage: text("to_stage").notNull(),
  changedAt: timestamp("changed_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  changedBy: text("changed_by"),
  note: text("note"),
});

export type StageHistoryRecord = typeof stageHistory.$inferSelect;

// --- Issue #5: Signals, scoring, auto-qualification ---

export const signalTypes = [
  "open_sales_role",
  "open_ops_role",
  "recent_funding",
  "leadership_change",
  "pe_owned",
  "multi_site_expansion",
  "certification_added",
  "event_exhibitor",
] as const;

export type SignalType = (typeof signalTypes)[number];

export const companySignals = pgTable("company_signals", {
  id: uuid("id").defaultRandom().primaryKey(),
  companyId: uuid("company_id")
    .notNull()
    .references(() => companies.id),
  signalType: text("signal_type").notNull(),
  value: jsonb("value"),
  source: text("source"),
  observedAt: timestamp("observed_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  weightAtObservation: integer("weight_at_observation").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type CompanySignal = typeof companySignals.$inferSelect;
export type NewCompanySignal = typeof companySignals.$inferInsert;

export const filterConfig = pgTable("filter_config", {
  id: uuid("id").defaultRandom().primaryKey(),
  filters: jsonb("filters")
    .notNull()
    .$type<{ headcount_min: number; headcount_max: number; geography: string[] }>(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedBy: text("updated_by"),
});

export type FilterConfig = typeof filterConfig.$inferSelect;

export const scoringConfig = pgTable("scoring_config", {
  id: uuid("id").defaultRandom().primaryKey(),
  weights: jsonb("weights")
    .notNull()
    .$type<Record<string, number>>(),
  threshold: integer("threshold").notNull().default(50),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedBy: text("updated_by"),
});

export type ScoringConfig = typeof scoringConfig.$inferSelect;

// --- Prospecting: conferences → exhibitors → contacts ---

export const industryKind = ["meta", "vertical"] as const;
export type IndustryKind = (typeof industryKind)[number];

export const prospectingIndustries = pgTable(
  "prospecting_industries",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    label: text("label").notNull(),
    // 'meta' = always-applied operating context (Oil & Gas, Industrial Services).
    // 'vertical' = a specific niche to prospect for (SIPA, TICC, etc.).
    kind: text("kind").notNull().default("vertical"),
    searchTerms: text("search_terms").array(),
    active: boolean("active").notNull().default(true),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("prospecting_industries_label_idx").on(table.label),
  ],
);

export type ProspectingIndustry = typeof prospectingIndustries.$inferSelect;
export type NewProspectingIndustry = typeof prospectingIndustries.$inferInsert;

export const prospectingRunStatus = [
  "pending",
  "running",
  "completed",
  "failed",
] as const;

export type ProspectingRunStatus = (typeof prospectingRunStatus)[number];

export const prospectingRuns = pgTable("prospecting_runs", {
  id: uuid("id").defaultRandom().primaryKey(),
  parentRunId: uuid("parent_run_id"),
  industryId: uuid("industry_id").references(() => prospectingIndustries.id),
  status: text("status").notNull().default("pending"),
  conferencesFound: integer("conferences_found").notNull().default(0),
  exhibitorsScraped: integer("exhibitors_scraped").notNull().default(0),
  companiesEnriched: integer("companies_enriched").notNull().default(0),
  prospectsAdded: integer("prospects_added").notNull().default(0),
  contactsAdded: integer("contacts_added").notNull().default(0),
  error: text("error"),
  startedAt: timestamp("started_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  finishedAt: timestamp("finished_at", { withTimezone: true }),
});

export type ProspectingRun = typeof prospectingRuns.$inferSelect;
export type NewProspectingRun = typeof prospectingRuns.$inferInsert;

export const contacts = pgTable(
  "contacts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    companyId: uuid("company_id")
      .notNull()
      .references(() => companies.id),
    firstName: text("first_name"),
    lastName: text("last_name"),
    fullName: text("full_name"),
    // Lowercased + trimmed; used for dedupe with normalizedTitle.
    normalizedName: text("normalized_name").notNull(),
    title: text("title"),
    normalizedTitle: text("normalized_title").notNull(),
    email: text("email"),
    phone: text("phone"),
    linkedinUrl: text("linkedin_url"),
    department: text("department"),
    seniority: text("seniority"),
    source: text("source"),
    externalId: text("external_id"),
    enrichmentSources: jsonb("enrichment_sources"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("contacts_company_name_title_idx").on(
      table.companyId,
      table.normalizedName,
      table.normalizedTitle,
    ),
  ],
);

export type Contact = typeof contacts.$inferSelect;
export type NewContact = typeof contacts.$inferInsert;
