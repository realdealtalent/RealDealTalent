import { eq } from "drizzle-orm";
import { inngest } from "@/inngest/client";
import { db } from "@/db";
import { prospectingIndustries, prospectingRuns } from "@/db/schema";
import { firecrawlSearch } from "@/lib/firecrawl";
import { prospectConference } from "./prospect-conference";

const MAX_CONFERENCES_PER_INDUSTRY = 25;

export const prospectIndustry = inngest.createFunction(
  { id: "prospect-industry", retries: 2 },
  { event: "prospecting/industry.requested" },
  async ({ event, step }) => {
    const { runId, industryId, metas } = event.data;

    const industry = await step.run("load-industry", async () => {
      const [row] = await db
        .select()
        .from(prospectingIndustries)
        .where(eq(prospectingIndustries.id, industryId))
        .limit(1);
      if (!row) throw new Error(`industry not found: ${industryId}`);
      return row;
    });

    await step.run("mark-running", async () => {
      await db
        .update(prospectingRuns)
        .set({ status: "running" })
        .where(eq(prospectingRuns.id, runId));
    });

    const conferences = await step.run("find-conferences", async () => {
      const year = new Date().getFullYear();
      const queries: string[] = [
        `${industry.label} conference ${year} exhibitors`,
        `${industry.label} trade show ${year} sponsors`,
      ];

      // Vertical × each active meta — combines niche term with operating context.
      for (const meta of metas) {
        queries.push(`${industry.label} ${meta.label} conference ${year}`);
      }

      // Vertical search terms — paired with each meta when metas are active.
      for (const term of industry.searchTerms ?? []) {
        if (metas.length === 0) {
          queries.push(`${term} conference ${year}`);
        } else {
          for (const meta of metas) {
            queries.push(`${term} ${meta.label} conference ${year}`);
          }
        }
      }

      const seen = new Set<string>();
      const out: { url: string; title?: string }[] = [];
      for (const query of queries) {
        const results = await firecrawlSearch(query, { limit: 5 });
        for (const r of results) {
          if (seen.has(r.url)) continue;
          seen.add(r.url);
          out.push({ url: r.url, title: r.title });
          if (out.length >= MAX_CONFERENCES_PER_INDUSTRY) break;
        }
        if (out.length >= MAX_CONFERENCES_PER_INDUSTRY) break;
      }
      return out;
    });

    await step.run("record-conference-count", async () => {
      await db
        .update(prospectingRuns)
        .set({ conferencesFound: conferences.length })
        .where(eq(prospectingRuns.id, runId));
    });

    if (conferences.length === 0) {
      await step.run("mark-completed-empty", async () => {
        await db
          .update(prospectingRuns)
          .set({ status: "completed", finishedAt: new Date() })
          .where(eq(prospectingRuns.id, runId));
      });
      return { conferences: 0 };
    }

    const results = await Promise.allSettled(
      conferences.map((conf, i) =>
        step.invoke(`process-conference-${i}`, {
          function: prospectConference,
          data: {
            runId,
            industryId,
            conferenceUrl: conf.url,
            conferenceName: conf.title ?? conf.url,
            metas,
          },
        }),
      ),
    );

    const failed = results.filter((r) => r.status === "rejected").length;

    await step.run("mark-completed", async () => {
      await db
        .update(prospectingRuns)
        .set({
          status: "completed",
          error:
            failed > 0
              ? `${failed}/${conferences.length} conferences failed`
              : null,
          finishedAt: new Date(),
        })
        .where(eq(prospectingRuns.id, runId));
    });

    return { conferences: conferences.length, failed };
  },
);
