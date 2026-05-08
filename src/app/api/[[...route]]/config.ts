import { Hono } from "hono";
import { db } from "@/db";
import { filterConfig, scoringConfig, lostReasons } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import {
  getFilterConfig,
  getScoringConfig,
  recomputeAllScores,
} from "@/lib/scoring";

const app = new Hono();

// --- Hard Filters ---

app.get("/filters", async (c) => {
  const filters = await getFilterConfig();
  return c.json(filters);
});

app.patch("/filters", async (c) => {
  const body = await c.req.json();

  // Validate
  if (body.headcount_min != null && typeof body.headcount_min !== "number") {
    return c.json({ error: "headcount_min must be a number" }, 400);
  }
  if (body.headcount_max != null && typeof body.headcount_max !== "number") {
    return c.json({ error: "headcount_max must be a number" }, 400);
  }
  if (body.geography != null && !Array.isArray(body.geography)) {
    return c.json({ error: "geography must be an array" }, 400);
  }

  const current = await getFilterConfig();
  const updated = {
    headcount_min: body.headcount_min ?? current.headcount_min,
    headcount_max: body.headcount_max ?? current.headcount_max,
    geography: body.geography ?? current.geography,
  };

  if (updated.headcount_min > updated.headcount_max) {
    return c.json({ error: "headcount_min cannot exceed headcount_max" }, 400);
  }

  // Upsert — check if row exists
  const [existing] = await db.select().from(filterConfig).limit(1);
  if (existing) {
    await db
      .update(filterConfig)
      .set({ filters: updated, updatedAt: new Date(), updatedBy: "operator" })
      .where(eq(filterConfig.id, existing.id));
  } else {
    await db.insert(filterConfig).values({
      filters: updated,
      updatedBy: "operator",
    });
  }

  const recomputeResult = await recomputeAllScores();

  return c.json({ filters: updated, recompute: recomputeResult });
});

// --- Scoring Weights & Threshold ---

app.get("/scoring", async (c) => {
  const config = await getScoringConfig();
  return c.json(config);
});

app.patch("/scoring", async (c) => {
  const body = await c.req.json();

  if (body.threshold != null && (typeof body.threshold !== "number" || body.threshold < 0)) {
    return c.json({ error: "threshold must be a non-negative number" }, 400);
  }
  if (body.weights != null && typeof body.weights !== "object") {
    return c.json({ error: "weights must be an object" }, 400);
  }

  const current = await getScoringConfig();
  const updatedWeights = body.weights
    ? { ...current.weights, ...body.weights }
    : current.weights;
  const updatedThreshold = body.threshold ?? current.threshold;

  // Validate weight values
  for (const [key, val] of Object.entries(updatedWeights)) {
    if (typeof val !== "number" || val < 0 || val > 50) {
      return c.json({ error: `Weight "${key}" must be 0–50` }, 400);
    }
  }

  const [existing] = await db.select().from(scoringConfig).limit(1);
  if (existing) {
    await db
      .update(scoringConfig)
      .set({
        weights: updatedWeights,
        threshold: updatedThreshold,
        updatedAt: new Date(),
        updatedBy: "operator",
      })
      .where(eq(scoringConfig.id, existing.id));
  } else {
    await db.insert(scoringConfig).values({
      weights: updatedWeights,
      threshold: updatedThreshold,
      updatedBy: "operator",
    });
  }

  const recomputeResult = await recomputeAllScores();

  return c.json({
    weights: updatedWeights,
    threshold: updatedThreshold,
    recompute: recomputeResult,
  });
});

// --- Lost Reasons ---

app.get("/lost-reasons", async (c) => {
  const rows = await db
    .select()
    .from(lostReasons)
    .orderBy(asc(lostReasons.sortOrder));

  return c.json(rows);
});

app.post("/lost-reasons", async (c) => {
  const body = await c.req.json();

  if (!body.label || !body.slug) {
    return c.json({ error: "label and slug are required" }, 400);
  }

  // Check slug uniqueness
  const [existing] = await db
    .select()
    .from(lostReasons)
    .where(eq(lostReasons.slug, body.slug))
    .limit(1);

  if (existing) {
    return c.json({ error: `Slug "${body.slug}" already exists` }, 409);
  }

  // Get max sort order
  const allReasons = await db
    .select({ sortOrder: lostReasons.sortOrder })
    .from(lostReasons)
    .orderBy(asc(lostReasons.sortOrder));

  const maxOrder = allReasons.length > 0
    ? Math.max(...allReasons.map((r) => r.sortOrder))
    : -1;

  const [reason] = await db
    .insert(lostReasons)
    .values({
      label: body.label,
      slug: body.slug,
      active: body.active ?? true,
      sortOrder: body.sortOrder ?? maxOrder + 1,
    })
    .returning();

  return c.json(reason, 201);
});

app.patch("/lost-reasons/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();

  const updates: Record<string, unknown> = {};

  if ("label" in body) updates.label = body.label;
  if ("slug" in body) updates.slug = body.slug;
  if ("active" in body) updates.active = body.active;
  if ("sortOrder" in body) updates.sortOrder = body.sortOrder;

  if (Object.keys(updates).length === 0) {
    return c.json({ error: "No valid fields to update" }, 400);
  }

  // If slug is being changed, check uniqueness
  if (updates.slug) {
    const [existing] = await db
      .select()
      .from(lostReasons)
      .where(eq(lostReasons.slug, updates.slug as string))
      .limit(1);

    if (existing && existing.id !== id) {
      return c.json({ error: `Slug "${updates.slug}" already exists` }, 409);
    }
  }

  const [reason] = await db
    .update(lostReasons)
    .set(updates)
    .where(eq(lostReasons.id, id))
    .returning();

  if (!reason) {
    return c.json({ error: "Lost reason not found" }, 404);
  }

  return c.json(reason);
});

export default app;
