import { db } from "./index";
import { prospectingIndustries } from "./schema";

// Sourced from the landing page "Industries We Serve" section + About copy.
// Metas are always-applied operating context; verticals are prospected for
// individually. Search terms widen the conference-search net since insider
// acronyms like TICC / SIPA rarely appear in event titles.
const defaults = [
  // ── Meta (Operating Context) ──
  {
    label: "Oil & Gas",
    kind: "meta",
    searchTerms: ["oil and gas", "upstream", "midstream", "downstream", "pipeline"],
    active: true,
    sortOrder: 0,
  },
  {
    label: "Industrial Services",
    kind: "meta",
    searchTerms: ["industrial services", "industrial maintenance", "plant services"],
    active: true,
    sortOrder: 1,
  },

  // ── Verticals (Industries to Prospect) ──
  {
    label: "SIPA Contractors",
    kind: "vertical",
    searchTerms: [
      "scaffolding",
      "insulation",
      "painting",
      "abatement",
      "industrial coatings",
      "surface preparation",
      "access services",
    ],
    active: true,
    sortOrder: 10,
  },
  {
    label: "TICC Contractors",
    kind: "vertical",
    searchTerms: [
      "NDT",
      "non-destructive testing",
      "inspection",
      "certification",
      "pipeline integrity",
      "ILI",
      "in-line inspection",
      "asset integrity",
    ],
    active: true,
    sortOrder: 11,
  },
  {
    label: "Heavy Equipment",
    kind: "vertical",
    searchTerms: [
      "equipment rental",
      "earthmoving",
      "aerial platforms",
      "telehandlers",
      "concrete equipment",
      "construction equipment",
    ],
    active: true,
    sortOrder: 12,
  },
  {
    label: "Master Distribution",
    kind: "vertical",
    searchTerms: [
      "electrical distribution",
      "power utility",
      "electrical components",
      "electrical wholesale",
      "OEM distribution",
    ],
    active: true,
    sortOrder: 13,
  },
];

async function seed() {
  for (const row of defaults) {
    await db
      .insert(prospectingIndustries)
      .values(row)
      .onConflictDoNothing({ target: prospectingIndustries.label });
  }
  console.log(`Seeded prospecting_industries (${defaults.length} rows)`);
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
