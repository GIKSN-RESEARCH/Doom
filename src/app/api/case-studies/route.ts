import type { Prisma } from "@prisma/client";
import type { NextRequest } from "next/server";
import { handleRouteError, json, jsonError } from "@/lib/http";
import {
  listResponse,
  parseOptionalBoolean,
  parseOptionalTag,
  parsePagination,
} from "@/lib/pagination";
import { prisma } from "@/lib/prisma";
import { caseStudyListSelect } from "@/lib/selects";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { page, limit, skip, take } = parsePagination(
      request.nextUrl.searchParams,
    );
    const tag = parseOptionalTag(request.nextUrl.searchParams.get("tag"));
    const featured = parseOptionalBoolean(
      request.nextUrl.searchParams.get("featured"),
    );

    if (
      request.nextUrl.searchParams.get("featured") &&
      featured === undefined
    ) {
      return jsonError("featured must be true or false", 400);
    }

    const where: Prisma.CaseStudyWhereInput = { published: true };
    if (tag) where.tags = { has: tag };
    if (featured !== undefined) where.featured = featured;

    const [items, total] = await Promise.all([
      prisma.caseStudy.findMany({
        where,
        select: caseStudyListSelect,
        take,
        skip,
        orderBy: { publishedAt: "desc" },
      }),
      prisma.caseStudy.count({ where }),
    ]);

    return json(listResponse(items, page, limit, total));
  } catch (error) {
    return handleRouteError(error);
  }
}
