import type { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { parseUpdatePatchInput } from "@/lib/content-input";
import { handleRouteError, json, jsonError, readJsonBody } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { updateDetailSelect } from "@/lib/selects";

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
    const existing = await prisma.updatePost.findFirst({
      where: { id },
      select: updateDetailSelect,
    });

    if (!existing) {
      return jsonError("Not found", 404);
    }

    const body = await readJsonBody(request);
    const data = parseUpdatePatchInput(body, existing);

    const item = await prisma.updatePost.update({
      where: { id },
      data,
      select: updateDetailSelect,
    });

    return json(item);
  } catch (error) {
    return handleRouteError(error);
  }
}
