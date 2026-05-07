# Beachhead — Domain Language

## Glossary

**Company.** The canonical representation of an external organization in the system. A Company exists from the moment it is discovered (scraped from an exhibitor list, manually entered, or imported via CSV). All other entities (Prospect, Lead, Account) layer status on top of a Company. Table: `companies`.

### Company BD Pipeline (pre-signing)

The full status progression for a Company through the BD funnel:

`prospect → qualified → outreach → lead → hot_lead → meeting_booked → meeting_held → proposal_sent → signed`

At `signed`, an Account is created and the Company gains Account status.

Negative paths:
- **Rejected** — the operator manually marks the Company as dead. Rejection is *not* automatic when a single contact declines — individual contact rejections are tracked at the contact level. The Company only moves to Rejected when the operator decides to give up on it. Requires selecting a lost reason from a user-configurable enum (defaults: `no_budget`, `using_competitor`, `no_open_roles`, `ghosted`, `bad_fit`, `wrong_timing`, `internal_hire`, `other_with_note`). Rejected is not permanent — the operator can manually re-activate a Rejected Company back to `qualified` when circumstances change. Rejection history is preserved in the stage log.
- **Cooldown** — no response to outreach from any contact. The 2-month cooldown clock starts when the SourceWhale sequence completes (all steps exhausted, no reply). At the end of cooldown, the Company returns to `qualified` status — eligible for re-approach but not auto-enrolled in a new sequence. The operator decides whether to re-trigger outreach. A high-value signal during cooldown (e.g., new open role) surfaces in the activity feed and allows the operator to manually override cooldown early.

The term "Opportunity" is not used. The Company entity carries its own pipeline status directly.

### Qualification Model

Qualification is two layers:

1. **Filters (pass/fail).** Hard requirements that gate eligibility. A Company that fails any filter is disqualified regardless of other signals. Configurable in Settings. v1 defaults: headcount 25–300, geography US or CA.

2. **Scoring (ranking).** Among Companies that pass all filters, weighted signals determine priority. Signals include: open sales/ops roles, recent funding, PE ownership, leadership changes, event exhibitor status, multi-site expansion, certifications. Each signal has a configurable weight. A threshold on the total score determines whether a Company moves from `prospect` to `qualified`. The "Why this score" panel only shows scoring signals, not filters.

**Event.** An industry conference or trade show relevant to the operator's verticals (SIPA, NDT, TIC, etc.). Events are one discovery source among several — not the primary ingest path. When an Event is marked as "watching," its exhibitor list is scraped and those Companies enter the pipeline. Events also provide timing context for outreach ("ACME is exhibiting next week").

**Spec Sheet.** LLM-drafted research brief attached to a Company. Contains likely roles, pain-point hypotheses, signals summary, suggested pitch angle, recommended outreach sequence, and recommended primary contact. Generated when a Company reaches `qualified` status. One living Spec Sheet per Company — refreshed on re-qualification after cooldown (new signals, updated contacts) but human-confirmed fields are preserved across iterations. Each field is individually editable and regenerable. The Spec Sheet remains fully editable after signing — it serves as ongoing reference context during delivery, not just a BD artifact.

**Prospect.** A Company that has been discovered and enriched with firmographics. This is the entry point of the BD funnel. Companies enter as Prospects from multiple sources: conference exhibitor lists, ZoomInfo/Apollo searches, LinkedIn research, referrals, manual entry, CSV import. The pipeline is source-agnostic — all sources feed the same enrichment and qualification flow.

**Qualified Prospect.** A Prospect that has passed the scoring threshold. Eligible for outreach sequences.

**Lead.** A Qualified Prospect where a contact has responded to the initial outreach email.

**Hot Lead.** A Lead where the response indicates positive interest.

**Account.** A Company that has signed a service agreement. An Account is created at the point of signing. The Account persists across multiple Engagements — it represents the ongoing client relationship, not a single scope of work. The term "Account" is never used for unsigned prospects or leads. An Account is either Active or Inactive.

**Active Account.** An Account that has at least one live (open) Role across its Engagements.

**Inactive Account.** An Account with no live Roles. Still a signed client — just not currently hiring through you.

**Engagement.** A discrete scope of work under an Account. One Account may have many Engagements over time. Each Engagement contains one or more Roles to fill.

**Role.** A position the operator is contracted to fill under an Engagement. Has structured definition (title, level, location, comp band, must-haves, nice-to-haves). Candidates pipeline against a Role. May be seeded from Likely Roles in the Spec Sheet at Engagement creation, but is a distinct entity from that point on.

**Job Posting.** A publicly posted position scraped from a job board or company career page. A scoring signal on a Company. The operator did not create it and is not necessarily filling it. Distinct from a Role.

**Likely Role.** A hypothesized position within the Spec Sheet — the operator's (or LLM's) best guess at what the Company needs, used to shape outreach. Not yet contracted. Distinct from both Job Postings and Roles.

**Contact.** A person at a Company. Contacts belong to the Company and persist across the full lifecycle. A Company has multiple Contacts who serve different purposes: some are BD outreach targets (e.g., VP of Sales), others are delivery stakeholders (e.g., HR Director). The same Contact may serve both roles. Outreach state (sequence enrollment, response status) is tracked per-Contact. Contacts may also be linked to specific Engagements to denote their role in that scope of work (e.g., hiring manager).

**Candidate.** A person in the operator's talent pool. Candidates are global — they exist independently of any specific Role. A Candidate can be considered for multiple Roles across different Companies over time.

**Candidacy.** The association between a Candidate and a Role. Carries its own stage progression (sourced → contacted → replied → screened → submitted → interview → offer → placed | rejected). One Candidate may have many Candidacies across different Roles. This gives the operator a full history: past submissions, placements, and outcomes for each person.

**Placement.** Created when a Candidacy reaches `placed`. The financial record of a successful hire. Tracks candidate comp, fee earned (computed from Engagement terms), fee status (pending → invoiced → paid), and guarantee expiry. Revenue rolls up to Account, quarter, and year views.
