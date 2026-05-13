// Firecrawl client — search + scrape + JSON extraction.
// TODO: set FIRECRAWL_API_KEY in env before invoking these functions.

const FIRECRAWL_BASE = "https://api.firecrawl.dev/v1";

function apiKey(): string {
  const key = process.env.FIRECRAWL_API_KEY;
  if (!key) {
    throw new Error(
      "FIRECRAWL_API_KEY is not set — required for prospecting pipeline",
    );
  }
  return key;
}

async function firecrawlPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${FIRECRAWL_BASE}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(
      `Firecrawl ${path} failed: ${res.status} ${await res.text()}`,
    );
  }
  return (await res.json()) as T;
}

export type FirecrawlSearchResult = {
  url: string;
  title?: string;
  description?: string;
};

export async function firecrawlSearch(
  query: string,
  opts: { limit?: number } = {},
): Promise<FirecrawlSearchResult[]> {
  const json = await firecrawlPost<{ data: FirecrawlSearchResult[] }>(
    "/search",
    { query, limit: opts.limit ?? 10 },
  );
  return json.data ?? [];
}

export type ExtractedExhibitor = {
  name: string;
  website?: string;
};

// Firecrawl scrape with structured JSON extraction — they run the LLM,
// we just declare the shape we want back. Cheaper and simpler than wiring
// our own LLM for unstructured exhibitor-page parsing.
export async function firecrawlExtractExhibitors(
  url: string,
): Promise<ExtractedExhibitor[]> {
  const schema = {
    type: "object",
    properties: {
      exhibitors: {
        type: "array",
        items: {
          type: "object",
          properties: {
            name: { type: "string" },
            website: { type: "string" },
          },
          required: ["name"],
        },
      },
    },
    required: ["exhibitors"],
  };

  const json = await firecrawlPost<{
    data?: { json?: { exhibitors?: ExtractedExhibitor[] } };
  }>("/scrape", {
    url,
    formats: ["json"],
    jsonOptions: {
      schema,
      prompt:
        "Extract every exhibitor, sponsor, or vendor company listed on this conference page. Include the company name and website if visible.",
    },
  });

  return json.data?.json?.exhibitors ?? [];
}
