import { Hono } from "hono";
import { asc, desc, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import {
  industryKind,
  prospectingIndustries,
  prospectingRuns,
  type IndustryKind,
} from "@/db/schema";
import { inngest } from "@/inngest/client";

const app = new Hono();

// --- Industries CRUD ---

app.get("/industries", async (c) => {
  const rows = await db
    .select()
    .from(prospectingIndustries)
    .orderBy(asc(prospectingIndustries.sortOrder), asc(prospectingIndustries.label));
  return c.json(rows);
});

app.post("/industries", async (c) => {
  const body = await c.req.json<{
    label?: string;
    kind?: string;
    searchTerms?: string[];
    active?: boolean;
    sortOrder?: number;
  }>();

  if (!body.label || !body.label.trim()) {
    return c.json({ error: "label is required" }, 400);
  }

  let kind: IndustryKind = "vertical";
  if (body.kind !== undefined) {
    if (!industryKind.includes(body.kind as IndustryKind)) {
      return c.json(
        { error: `kind must be one of: ${industryKind.join(", ")}` },
        400,
      );
    }
    kind = body.kind as IndustryKind;
  }

  const label = body.label.trim();

  const existing = await db
    .select({ id: prospectingIndustries.id })
    .from(prospectingIndustries)
    .where(eq(prospectingIndustries.label, label))
    .limit(1);

  if (existing.length > 0) {
    return c.json({ error: `Industry "${label}" already exists` }, 409);
  }

  const [created] = await db
    .insert(prospectingIndustries)
    .values({
      label,
      kind,
      searchTerms:
        body.searchTerms && body.searchTerms.length > 0
          ? body.searchTerms.map((t) => t.trim()).filter(Boolean)
          : null,
      active: body.active ?? true,
      sortOrder: body.sortOrder ?? 0,
    })
    .returning();

  return c.json(created, 201);
});

app.patch("/industries/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json<{
    label?: string;
    searchTerms?: string[];
    active?: boolean;
    sortOrder?: number;
  }>();

  const updates: Record<string, unknown> = { updatedAt: new Date() };
  if (typeof body.label === "string") updates.label = body.label.trim();
  if (Array.isArray(body.searchTerms)) {
    updates.searchTerms = body.searchTerms.map((t) => t.trim()).filter(Boolean);
  }
  if (typeof body.active === "boolean") updates.active = body.active;
  if (typeof body.sortOrder === "number") updates.sortOrder = body.sortOrder;

  const [updated] = await db
    .update(prospectingIndustries)
    .set(updates)
    .where(eq(prospectingIndustries.id, id))
    .returning();

  if (!updated) return c.json({ error: "Industry not found" }, 404);
  return c.json(updated);
});

app.delete("/industries/:id", async (c) => {
  const id = c.req.param("id");
  const [deleted] = await db
    .delete(prospectingIndustries)
    .where(eq(prospectingIndustries.id, id))
    .returning({ id: prospectingIndustries.id });
  if (!deleted) return c.json({ error: "Industry not found" }, 404);
  return c.json({ ok: true });
});

// --- Run lifecycle ---

app.post("/run", async (c) => {
  const body = await c.req
    .json<{ industryIds?: unknown }>()
    .catch(() => ({} as { industryIds?: unknown }));

  let industryIds: string[] | undefined;
  if (body.industryIds !== undefined) {
    if (
      !Array.isArray(body.industryIds) ||
      !body.industryIds.every((id) => typeof id === "string")
    ) {
      return c.json({ error: "industryIds must be an array of strings" }, 400);
    }
    industryIds = body.industryIds as string[];
  }

  // Create the parent run row up front so the UI has something to poll.
  const [parent] = await db
    .insert(prospectingRuns)
    .values({ status: "pending" })
    .returning();

  try {
    await inngest.send({
      name: "prospecting/run.requested",
      data: {
        parentRunId: parent.id,
        industryIds:
          industryIds && industryIds.length > 0 ? industryIds : undefined,
      },
    });
  } catch (err) {
    // Don't leave an orphan run row pointing at nothing.
    await db.delete(prospectingRuns).where(eq(prospectingRuns.id, parent.id));
    return c.json(
      { error: "Failed to dispatch prospecting run", detail: String(err) },
      502,
    );
  }

  return c.json({ runId: parent.id }, 202);
});

app.get("/runs", async (c) => {
  const rows = await db
    .select()
    .from(prospectingRuns)
    .where(isNull(prospectingRuns.parentRunId))
    .orderBy(desc(prospectingRuns.startedAt))
    .limit(20);
  return c.json(rows);
});

app.get("/runs/:id", async (c) => {
  const id = c.req.param("id");
  const [parent] = await db
    .select()
    .from(prospectingRuns)
    .where(eq(prospectingRuns.id, id))
    .limit(1);
  if (!parent) return c.json({ error: "Run not found" }, 404);

  const children = await db
    .select()
    .from(prospectingRuns)
    .where(eq(prospectingRuns.parentRunId, id))
    .orderBy(asc(prospectingRuns.startedAt));

  return c.json({ ...parent, children });
});

export default app;
