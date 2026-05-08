import { Hono } from "hono";
import { db } from "@/db";
import { lostReasons } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

const app = new Hono();

// GET /api/lost-reasons — list active lost reasons
app.get("/", async (c) => {
  const rows = await db
    .select()
    .from(lostReasons)
    .where(eq(lostReasons.active, true))
    .orderBy(asc(lostReasons.sortOrder));

  return c.json(rows);
});

export default app;
