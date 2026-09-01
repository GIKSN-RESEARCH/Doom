import type { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { parseArticlePatchInput } from "@/lib/content-input";
import { handleRouteError, json, jsonError, readJsonBody } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { articleDetailSelect } from "@/lib/selects";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const { id } = await params;
    const existing = await prisma.article.findFirst({
      where: { id },
      select: articleDetailSelect,
    });

    if (!existing) {
      return jsonError("Not found", 404);
    }

    const body = await readJsonBody(request);
    const data = parseArticlePatchInput(body, existing);

    const item = await prisma.article.update({
      where: { id },
      data,
      select: articleDetailSelect,
    });

    return json(item);
  } catch (error) {
    return handleRouteError(error);
  }
}
