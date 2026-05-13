// ZoomInfo REST client.
// Auth: username + password → JWT (60min). PKI auth is the recommended
// production path; swap in when you wire the prod credential.
// Response shapes follow the public ZoomInfo Enterprise API docs but should
// be validated against the user's actual tenant — field names occasionally
// vary by entitlement.

const ZOOMINFO_BASE = "https://api.zoominfo.com";

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) {
    return cachedToken.token;
  }
  const username = process.env.ZOOMINFO_USERNAME;
  const password = process.env.ZOOMINFO_PASSWORD;
  if (!username || !password) {
    throw new Error(
      "ZOOMINFO_USERNAME / ZOOMINFO_PASSWORD not set — required for enrichment",
    );
  }
  const res = await fetch(`${ZOOMINFO_BASE}/authenticate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) {
    throw new Error(
      `ZoomInfo auth failed: ${res.status} ${await res.text()}`,
    );
  }
  const json = (await res.json()) as { jwt: string };
  cachedToken = { token: json.jwt, expiresAt: Date.now() + 55 * 60_000 };
  return json.jwt;
}

async function zoominfoPost<T>(path: string, body: unknown): Promise<T> {
  const token = await getToken();
  const res = await fetch(`${ZOOMINFO_BASE}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (res.status === 401) {
    cachedToken = null;
    throw new Error("ZoomInfo token expired — retry");
  }
  if (!res.ok) {
    throw new Error(
      `ZoomInfo ${path} failed: ${res.status} ${await res.text()}`,
    );
  }
  return (await res.json()) as T;
}

export type ZoomInfoCompany = {
  id: number;
  name: string;
  website?: string;
  linkedInUrl?: string;
  employeeCount?: number;
  industries?: string[];
  primaryIndustry?: string[];
  city?: string;
  state?: string;
  country?: string;
};

export async function enrichCompany(opts: {
  domain?: string;
  name?: string;
}): Promise<ZoomInfoCompany | null> {
  const json = await zoominfoPost<{
    data?: { result?: Array<{ data?: ZoomInfoCompany[] }> };
  }>("/enrich/company", {
    matchCompanyInput: [
      {
        companyName: opts.name,
        companyWebsite: opts.domain,
      },
    ],
    outputFields: [
      "id",
      "name",
      "website",
      "linkedInUrl",
      "employeeCount",
      "industries",
      "primaryIndustry",
      "city",
      "state",
      "country",
    ],
  });
  return json.data?.result?.[0]?.data?.[0] ?? null;
}

export type ZoomInfoContact = {
  id: number;
  firstName?: string;
  lastName?: string;
  jobTitle?: string;
  email?: string;
  phone?: string;
  linkedInUrl?: string;
  department?: string;
  managementLevel?: string;
};

export async function searchContacts(opts: {
  companyId: number;
  jobTitles?: string[];
  limit?: number;
}): Promise<ZoomInfoContact[]> {
  const json = await zoominfoPost<{ data?: ZoomInfoContact[] }>(
    "/search/contact",
    {
      companyId: opts.companyId,
      jobTitle: opts.jobTitles?.join(", "),
      rpp: opts.limit ?? 25,
      outputFields: [
        "id",
        "firstName",
        "lastName",
        "jobTitle",
        "email",
        "phone",
        "linkedInUrl",
        "department",
        "managementLevel",
      ],
    },
  );
  return json.data ?? [];
}
