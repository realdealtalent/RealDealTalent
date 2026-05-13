import { eq, sql } from "drizzle-orm";
import { inngest } from "@/inngest/client";
import { db } from "@/db";
import {
  companies,
  contacts,
  prospectingIndustries,
  prospectingRuns,
} from "@/db/schema";
import { firecrawlExtractExhibitors } from "@/lib/firecrawl";
import {
  enrichCompany,
  searchContacts,
  type ZoomInfoCompany,
} from "@/lib/zoominfo";
import { addSignal } from "@/lib/scoring";
import {
  contactDedupeKey,
  industryMatchesAny,
  isInProspectHeadcountWindow,
  isUniqueViolation,
  normalizeDomain,
  TARGET_TITLES,
} from "@/lib/prospecting-rules";

// Exported separately so tests can exercise the handler directly without
// bringing in the Inngest runtime. The Inngest registration below wires
// the same function in for production.
type ConferenceCtx = {
  event: {
    data: {
      runId: string;
      industryId: string;
      conferenceUrl: string;
      conferenceName: string;
      metas: Array<{ label: string; searchTerms: string[] | null }>;
    };
  };
  step: { run<T>(id: string, fn: () => Promise<T> | T): Promise<T> };
};

export async function prospectConferenceHandler({ event, step }: ConferenceCtx) {
  const { runId, industryId, conferenceUrl, conferenceName, metas } = event.data;

    const industry = await step.run("load-industry", async () => {
      const [row] = await db
        .select()
        .from(prospectingIndustries)
        .where(eq(prospectingIndustries.id, industryId))
        .limit(1);
      if (!row) throw new Error(`industry not found: ${industryId}`);
      return row;
    });

    const exhibitors = await step.run("extract-exhibitors", async () => {
      return firecrawlExtractExhibitors(conferenceUrl);
    });

    if (exhibitors.length === 0) {
      return { prospectsAdded: 0, contactsAdded: 0 };
    }

    const enriched = await step.run("enrich-companies", async () => {
      const out: { exhibitor: { name: string; website?: string }; zoom: ZoomInfoCompany }[] = [];
      for (const ex of exhibitors) {
        try {
          const z = await enrichCompany({
            name: ex.name,
            domain: normalizeDomain(ex.website) ?? undefined,
          });
          if (z) out.push({ exhibitor: ex, zoom: z });
        } catch {
          // Skip individual enrichment failures — the rest of the batch continues.
        }
      }
      return out;
    });

    const matchTargets = [
      { label: industry.label, searchTerms: industry.searchTerms },
      ...metas,
    ];

    const matches = enriched.filter(({ zoom }) => {
      if (!isInProspectHeadcountWindow(zoom.employeeCount)) return false;
      const actualIndustries = [
        ...(zoom.industries ?? []),
        ...(zoom.primaryIndustry ?? []),
      ];
      return industryMatchesAny(actualIndustries, matchTargets);
    });

    const persisted = await step.run("persist-matches", async () => {
      let prospectsAdded = 0;
      let contactsAdded = 0;

      for (const { zoom } of matches) {
        const domain = normalizeDomain(zoom.website);
        if (!domain) continue;

        const [existing] = await db
          .select()
          .from(companies)
          .where(eq(companies.domain, domain))
          .limit(1);

        let companyId: string;

        if (!existing) {
          const industryTags = [
            ...(zoom.primaryIndustry ?? []),
            ...(zoom.industries ?? []),
          ];
          const [created] = await db
            .insert(companies)
            .values({
              name: zoom.name,
              domain,
              employeeCount: zoom.employeeCount ?? null,
              industry: industryTags.length > 0 ? industryTags : null,
              linkedinUrl: zoom.linkedInUrl ?? null,
              hqState: zoom.state ?? null,
              hqCountry: zoom.country ?? null,
              source: "event_scrape",
              enrichmentSources: {
                zoominfo: {
                  id: zoom.id,
                  fetchedAt: new Date().toISOString(),
                },
              },
              status: "prospect",
            })
            .returning();
          companyId = created.id;
          prospectsAdded++;
        } else {
          companyId = existing.id;
        }

        // event_exhibitor signal (always — even for existing companies).
        // addSignal triggers re-qualification with current weights.
        await addSignal(companyId, {
          signalType: "event_exhibitor",
          value: { conferenceUrl, conferenceName },
          source: "firecrawl_scrape",
        });

        // Contacts — even for existing companies, new contacts get added.
        const contactRows = await searchContacts({
          companyId: zoom.id,
          jobTitles: TARGET_TITLES,
          limit: 25,
        });

        for (const c of contactRows) {
          const key = contactDedupeKey(c.firstName, c.lastName, c.jobTitle);
          if (!key) continue;

          try {
            await db.insert(contacts).values({
              companyId,
              firstName: c.firstName ?? null,
              lastName: c.lastName ?? null,
              fullName: key.fullName,
              normalizedName: key.normalizedName,
              title: c.jobTitle ?? null,
              normalizedTitle: key.normalizedTitle,
              email: c.email ?? null,
              phone: c.phone ?? null,
              linkedinUrl: c.linkedInUrl ?? null,
              department: c.department ?? null,
              seniority: c.managementLevel ?? null,
              source: "zoominfo",
              externalId: String(c.id),
              enrichmentSources: {
                zoominfo: { fetchedAt: new Date().toISOString() },
              },
            });
            contactsAdded++;
          } catch (err) {
            // unique (companyId, normalizedName, normalizedTitle) → already have this contact.
            // Anything else is a real failure that must surface.
            if (!isUniqueViolation(err)) throw err;
          }
        }
      }

      return { prospectsAdded, contactsAdded };
    });

    await step.run("increment-run-counters", async () => {
      await db
        .update(prospectingRuns)
        .set({
          exhibitorsScraped: sql`${prospectingRuns.exhibitorsScraped} + ${exhibitors.length}`,
          companiesEnriched: sql`${prospectingRuns.companiesEnriched} + ${enriched.length}`,
          prospectsAdded: sql`${prospectingRuns.prospectsAdded} + ${persisted.prospectsAdded}`,
          contactsAdded: sql`${prospectingRuns.contactsAdded} + ${persisted.contactsAdded}`,
        })
        .where(eq(prospectingRuns.id, runId));
    });

  return persisted;
}

export const prospectConference = inngest.createFunction(
  {
    id: "prospect-conference",
    retries: 2,
    concurrency: { limit: 5 },
  },
  { event: "prospecting/conference.requested" },
  prospectConferenceHandler,
);
