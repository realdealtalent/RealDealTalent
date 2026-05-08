import { db } from "./index";
import { lostReasons } from "./schema";

const defaults = [
  { label: "No Budget", slug: "no_budget", sortOrder: 1 },
  { label: "Using Competitor", slug: "using_competitor", sortOrder: 2 },
  { label: "No Open Roles", slug: "no_open_roles", sortOrder: 3 },
  { label: "Ghosted", slug: "ghosted", sortOrder: 4 },
  { label: "Bad Fit", slug: "bad_fit", sortOrder: 5 },
  { label: "Wrong Timing", slug: "wrong_timing", sortOrder: 6 },
  { label: "Internal Hire", slug: "internal_hire", sortOrder: 7 },
  { label: "Other (with note)", slug: "other_with_note", sortOrder: 8 },
];

async function seed() {
  for (const reason of defaults) {
    await db
      .insert(lostReasons)
      .values(reason)
      .onConflictDoNothing({ target: lostReasons.slug });
  }
  console.log("Seeded lost_reasons");
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
