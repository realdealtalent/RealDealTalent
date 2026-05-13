import { and, eq, inArray } from "drizzle-orm";
import { inngest, type MetaSnapshot } from "@/inngest/client";
import { db } from "@/db";
import { prospectingIndustries, prospectingRuns } from "@/db/schema";
import { prospectIndustry } from "./prospect-industry";

export const runProspecting = inngest.createFunction(
  { id: "run-prospecting", retries: 1 },
  { event: "prospecting/run.requested" },
  async ({ event, step }) => {
    const { parentRunId, industryIds } = event.data;

    // Only verticals fan out as their own runs. Metas come along as context.
    const industries = await step.run("load-verticals", async () => {
      const where =
        industryIds && industryIds.length > 0
          ? and(
              eq(prospectingIndustries.active, true),
              eq(prospectingIndustries.kind, "vertical"),
              inArray(prospectingIndustries.id, industryIds),
            )
          : and(
              eq(prospectingIndustries.active, true),
              eq(prospectingIndustries.kind, "vertical"),
            );
      return db.select().from(prospectingIndustries).where(where);
    });

    const metas: MetaSnapshot[] = await step.run("load-metas", async () => {
      const rows = await db
        .select()
        .from(prospectingIndustries)
        .where(
          and(
            eq(prospectingIndustries.active, true),
            eq(prospectingIndustries.kind, "meta"),
          ),
        );
      return rows.map((r) => ({ label: r.label, searchTerms: r.searchTerms }));
    });

    if (industries.length === 0) {
      await step.run("mark-parent-empty", async () => {
        await db
          .update(prospectingRuns)
          .set({
            status: "completed",
            error: "no active industries to process",
            finishedAt: new Date(),
          })
          .where(eq(prospectingRuns.id, parentRunId));
      });
      return { industries: 0 };
    }

    const childRuns = await step.run("create-child-runs", async () => {
      return db
        .insert(prospectingRuns)
        .values(
          industries.map((ind) => ({
            parentRunId,
            industryId: ind.id,
            status: "pending",
          })),
        )
        .returning();
    });

    await step.run("mark-parent-running", async () => {
      await db
        .update(prospectingRuns)
        .set({ status: "running" })
        .where(eq(prospectingRuns.id, parentRunId));
    });

    const results = await Promise.allSettled(
      childRuns.map((child, i) =>
        step.invoke(`process-industry-${i}`, {
          function: prospectIndustry,
          data: {
            runId: child.id,
            parentRunId,
            industryId: child.industryId!,
            metas,
          },
        }),
      ),
    );

    const failed = results.filter((r) => r.status === "rejected").length;

    await step.run("mark-parent-completed", async () => {
      await db
        .update(prospectingRuns)
        .set({
          status: "completed",
          error:
            failed > 0 ? `${failed}/${childRuns.length} industries failed` : null,
          finishedAt: new Date(),
        })
        .where(eq(prospectingRuns.id, parentRunId));
    });

    return { industries: industries.length, failed };
  },
);
