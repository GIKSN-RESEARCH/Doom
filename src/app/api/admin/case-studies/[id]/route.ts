import type { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { parseCaseStudyPatchInput } from "@/lib/content-input";
import { handleRouteError, json, jsonError, readJsonBody } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { caseStudyDetailSelect } from "@/lib/selects";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteContext) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const { id } = await params;
    const item = await prisma.caseStudy.findFirst({
      where: { id },
      select: caseStudyDetailSelect,
    });

    if (!item) return jsonError("Not found", 404);
    return json(item);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const { id } = await params;
    const existing = await prisma.caseStudy.findFirst({
      where: { id },
      select: caseStudyDetailSelect,
    });

    if (!existing) {
      return jsonError("Not found", 404);
    }

    const body = await readJsonBody(request);
    const data = parseCaseStudyPatchInput(body, existing);

    const item = await prisma.caseStudy.update({
      where: { id },
      data,
      select: caseStudyDetailSelect,
    });

    return json(item);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const { id } = await params;
    const existing = await prisma.caseStudy.findFirst({
      where: { id },
      select: { id: true },
    });

    if (!existing) return jsonError("Not found", 404);

    await prisma.caseStudy.delete({ where: { id } });
    return json({ ok: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
