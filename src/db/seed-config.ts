import { db } from "./index";
import { filterConfig, scoringConfig } from "./schema";

const defaultFilters = {
  headcount_min: 25,
  headcount_max: 300,
  geography: ["US", "CA"],
};

const defaultWeights: Record<string, number> = {
  open_sales_role: 25,
  open_ops_role: 20,
  event_exhibitor: 15,
  recent_funding: 15,
  leadership_change: 15,
  pe_owned: 10,
  multi_site_expansion: 10,
  certification_added: 10,
};

const defaultThreshold = 50;

async function seed() {
  // Only insert if no config exists yet
  const existingFilters = await db.select().from(filterConfig).limit(1);
  if (existingFilters.length === 0) {
    await db.insert(filterConfig).values({ filters: defaultFilters });
    console.log("Seeded filter_config");
  } else {
    console.log("filter_config already exists, skipping");
  }

  const existingScoring = await db.select().from(scoringConfig).limit(1);
  if (existingScoring.length === 0) {
    await db.insert(scoringConfig).values({
      weights: defaultWeights,
      threshold: defaultThreshold,
    });
    console.log("Seeded scoring_config");
  } else {
    console.log("scoring_config already exists, skipping");
  }

  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
