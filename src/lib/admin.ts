import { timingSafeEqual } from "node:crypto";
import { jsonError } from "@/lib/http";

export const ADMIN_COOKIE = "doom_admin";
export const ADMIN_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

function keysMatch(provided: string, expected: string): boolean {
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function unauthorized(): Response {
  return jsonError("Unauthorized", 401);
}

function cookieValue(header: string | null, name: string): string | null {
  if (!header) return null;
  for (const part of header.split(";")) {
    const [rawKey, ...rest] = part.trim().split("=");
    if (rawKey !== name) continue;
    try {
      return decodeURIComponent(rest.join("="));
    } catch {
      return rest.join("=");
    }
  }
  return null;
}

export function readAdminKey(request: Request): string | null {
  const header = request.headers.get("x-admin-key")?.trim();
  if (header) return header;
  return cookieValue(request.headers.get("cookie"), ADMIN_COOKIE);
}

export function adminKeyMatches(provided: string): boolean {
  const expected = process.env.ADMIN_API_KEY;
  if (!expected || !provided) return false;
  return keysMatch(provided, expected);
}

export function requireAdmin(request: Request): Response | null {
  const provided = readAdminKey(request);
  if (!provided || !adminKeyMatches(provided)) {
    return unauthorized();
  }
  return null;
}

export function adminCookieOptions(maxAge = ADMIN_COOKIE_MAX_AGE) {
  return {
    httpOnly: true,
    sameSite: "strict" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  };
}
