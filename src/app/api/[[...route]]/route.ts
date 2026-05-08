import { Hono } from "hono";
import { handle } from "hono/vercel";
import { createSession, verifySession, sessionCookieName } from "@/lib/auth";
import { getCookie, setCookie, deleteCookie } from "hono/cookie";

const app = new Hono().basePath("/api");

// Health check — no auth required
app.get("/health", (c) => c.json({ status: "ok" }));

// Auth routes — no auth required
app.post("/auth/login", async (c) => {
  const body = await c.req.json<{ email: string; password: string }>();
  const allowedEmail = process.env.ALLOWED_EMAIL;

  if (!allowedEmail) {
    return c.json({ error: "Server misconfigured: no ALLOWED_EMAIL" }, 500);
  }

  if (body.email.toLowerCase() !== allowedEmail.toLowerCase()) {
    return c.json({ error: "Invalid credentials" }, 401);
  }

  // In v0, any password works for the allowed email.
  // Real auth (Entra ID) comes in v1.
  const token = await createSession(body.email);
  setCookie(c, sessionCookieName(), token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  return c.json({ ok: true });
});

app.post("/auth/logout", (c) => {
  deleteCookie(c, sessionCookieName(), { path: "/" });
  return c.json({ ok: true });
});

// Auth middleware for all other API routes
app.use("/*", async (c, next) => {
  // Skip auth for health and auth routes (already handled above)
  const path = c.req.path;
  if (path === "/api/health" || path.startsWith("/api/auth/")) {
    return next();
  }

  const token = getCookie(c, sessionCookieName());
  if (!token) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const session = await verifySession(token);
  if (!session) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  return next();
});

const handler = handle(app);

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
