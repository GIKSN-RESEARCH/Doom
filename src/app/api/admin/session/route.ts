import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  adminCookieOptions,
  adminKeyMatches,
  requireAdmin,
  unauthorized,
} from "@/lib/admin";
import { handleRouteError, readJsonBody } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const unauthorizedResponse = requireAdmin(request);
  if (unauthorizedResponse) return unauthorizedResponse;
  return NextResponse.json({ ok: true });
}

export async function POST(request: NextRequest) {
  try {
    const body = await readJsonBody(request);
    const key = typeof body.key === "string" ? body.key.trim() : "";
    if (!adminKeyMatches(key)) return unauthorized();

    const response = NextResponse.json({ ok: true });
    response.cookies.set(ADMIN_COOKIE, key, adminCookieOptions());
    return response;
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE, "", adminCookieOptions(0));
  return response;
}
