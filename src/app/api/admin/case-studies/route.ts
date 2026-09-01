import type { Prisma } from "@prisma/client";
import type { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/admin";
import {
  parseCaseStudyCreateInput,
} from "@/lib/content-input";
import { handleRouteError, json, jsonError, readJsonBody } from "@/lib/http";
import {
  listResponse,
  parseOptionalBoolean,
  parseOptionalPublished,
  parseOptionalTag,
  parsePagination,
} from "@/lib/pagination";
import { prisma } from "@/lib/prisma";
import { caseStudyDetailSelect, caseStudyListSelect } from "@/lib/selects";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const { page, limit, skip, take } = parsePagination(
      request.nextUrl.searchParams,
    );
    const tag = parseOptionalTag(request.nextUrl.searchParams.get("tag"));
    const featured = parseOptionalBoolean(
      request.nextUrl.searchParams.get("featured"),
    );
    const published = parseOptionalPublished(
      request.nextUrl.searchParams.get("published"),
    );

    if (
      request.nextUrl.searchParams.get("featured") &&
      featured === undefined
    ) {
      return jsonError("featured must be true or false", 400);
    }

    const where: Prisma.CaseStudyWhereInput = {};
    if (tag) where.tags = { has: tag };
    if (featured !== undefined) where.featured = featured;
    if (published !== undefined) where.published = published;

    const [items, total] = await Promise.all([
      prisma.caseStudy.findMany({
        where,
        select: caseStudyListSelect,
        take,
        skip,
        orderBy: { updatedAt: "desc" },
      }),
      prisma.caseStudy.count({ where }),
    ]);

    return json(listResponse(items, page, limit, total));
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: NextRequest) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const body = await readJsonBody(request);
    const data = parseCaseStudyCreateInput(body);

    const item = await prisma.caseStudy.create({
      data,
      select: caseStudyDetailSelect,
    });

    return json(item, 201);
  } catch (error) {
    return handleRouteError(error);
  }
}
