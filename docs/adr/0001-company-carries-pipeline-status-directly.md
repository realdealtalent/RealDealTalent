# ADR 0001: Company carries pipeline status directly — no Opportunity entity

## Status
Accepted

## Context
The original plan (v0.2) modeled the BD pipeline as a separate `opportunities` table with its own stages, linked to an `accounts` table. This created a three-entity chain: Account → Opportunity → Engagement.

During domain grilling, the operator defined precise funnel terminology: Prospect → Qualified Prospect → Lead → Hot Lead → Meeting Booked → Meeting Held → Proposal Sent → Signed. The term "Opportunity" does not exist in the operator's vocabulary. The pipeline status belongs to the Company itself, not to a separate tracking entity.

## Decision
The `opportunities` table is removed. The Company entity (`companies` table) carries a `status` column that tracks its position in the BD pipeline directly. The `spec_sheets` and `opportunity_contacts` tables are re-parented to `companies`. The `stage_history` table logs status transitions on the Company.

"Account" is not a table that replaces `opportunities` — it is a status milestone. When a Company reaches `signed`, an Account record is created representing the ongoing client relationship, and Engagements are scoped under it.

## Consequences
- Simpler data model: one fewer entity and join in the core BD flow.
- Pipeline queries are single-table filters (`WHERE status = 'hot_lead'`), not joins.
- Spec sheets, contacts, and stage history reference `company_id` directly.
- The plan's Epic C user stories need to be rewritten against Company, not Opportunity.
- If multi-user assignment is needed later, `owner` lives on the Company, not a separate entity.
