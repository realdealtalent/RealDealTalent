CREATE TABLE "companies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"domain" text NOT NULL,
	"hq_country" text,
	"hq_state" text,
	"employee_count" integer,
	"employee_band" text,
	"industry" text[],
	"revenue_band" text,
	"linkedin_url" text,
	"enrichment_sources" jsonb,
	"current_score" integer DEFAULT 0 NOT NULL,
	"status" text DEFAULT 'prospect' NOT NULL,
	"status_changed_at" timestamp with time zone,
	"cooldown_until" timestamp with time zone,
	"lost_reason" text,
	"lost_note" text,
	"source" text,
	"account_id" uuid,
	"owner" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "companies_domain_idx" ON "companies" USING btree ("domain");