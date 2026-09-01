import { timingSafeEqual } from "node:crypto";
import { jsonError } from "@/lib/http";

function keysMatch(provided: string, expected: string): boolean {
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function unauthorized(): Response {
  return jsonError("Unauthorized", 401);
}

export function requireAdmin(request: Request): Response | null {
  const expected = process.env.ADMIN_API_KEY;
  const provided = request.headers.get("x-admin-key");

  if (!expected || !provided || !keysMatch(provided, expected)) {
    return unauthorized();
  }

  return null;
}
