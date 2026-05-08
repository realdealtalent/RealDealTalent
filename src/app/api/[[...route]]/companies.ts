import { Hono } from "hono";
import { db } from "@/db";
import { companies } from "@/db/schema";
import { eq } from "drizzle-orm";

const app = new Hono();

// POST /api/companies — create a Company
app.post("/", async (c) => {
  const body = await c.req.json();

  if (!body.name || !body.domain) {
    return c.json({ error: "name and domain are required" }, 400);
  }

  // Normalize domain to lowercase
  const domain = body.domain.toLowerCase().trim();

  // Check for duplicate domain
  const existing = await db
    .select({ id: companies.id })
    .from(companies)
    .where(eq(companies.domain, domain))
    .limit(1);

  if (existing.length > 0) {
    return c.json(
      { error: `A company with domain "${domain}" already exists` },
      409,
    );
  }

  const [company] = await db
    .insert(companies)
    .values({
      name: body.name,
      domain,
      hqCountry: body.hqCountry ?? null,
      hqState: body.hqState ?? null,
      employeeCount: body.employeeCount ?? null,
      employeeBand: body.employeeBand ?? null,
      industry: body.industry ?? null,
      revenueBand: body.revenueBand ?? null,
      linkedinUrl: body.linkedinUrl ?? null,
      enrichmentSources: body.enrichmentSources ?? null,
      source: body.source ?? null,
      owner: body.owner ?? null,
    })
    .returning();

  return c.json(company, 201);
});

// GET /api/companies — list, optionally filter by status
app.get("/", async (c) => {
  const status = c.req.query("status");

  const query = db.select().from(companies);

  const rows = status
    ? await query.where(eq(companies.status, status))
    : await query;

  return c.json(rows);
});

// GET /api/companies/:id — detail
app.get("/:id", async (c) => {
  const id = c.req.param("id");

  const [company] = await db
    .select()
    .from(companies)
    .where(eq(companies.id, id))
    .limit(1);

  if (!company) {
    return c.json({ error: "Company not found" }, 404);
  }

  return c.json(company);
});

// PATCH /api/companies/:id — update firmographic fields
app.patch("/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();

  // Only allow updating firmographic and status fields
  const allowedFields = [
    "name",
    "domain",
    "hqCountry",
    "hqState",
    "employeeCount",
    "employeeBand",
    "industry",
    "revenueBand",
    "linkedinUrl",
    "enrichmentSources",
    "source",
    "owner",
    "status",
    "lostReason",
    "lostNote",
  ] as const;

  const updates: Record<string, unknown> = {};
  for (const field of allowedFields) {
    if (field in body) {
      updates[field] = body[field];
    }
  }

  // If domain is being updated, normalize and check for duplicates
  if (updates.domain) {
    updates.domain = (updates.domain as string).toLowerCase().trim();
    const existing = await db
      .select({ id: companies.id })
      .from(companies)
      .where(eq(companies.domain, updates.domain as string))
      .limit(1);

    if (existing.length > 0 && existing[0].id !== id) {
      return c.json(
        {
          error: `A company with domain "${updates.domain}" already exists`,
        },
        409,
      );
    }
  }

  // Track status changes
  if (updates.status) {
    updates.statusChangedAt = new Date();
  }

  if (Object.keys(updates).length === 0) {
    return c.json({ error: "No valid fields to update" }, 400);
  }

  updates.updatedAt = new Date();

  const [company] = await db
    .update(companies)
    .set(updates)
    .where(eq(companies.id, id))
    .returning();

  if (!company) {
    return c.json({ error: "Company not found" }, 404);
  }

  return c.json(company);
});

export default app;
