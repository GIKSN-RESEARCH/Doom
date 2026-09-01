import type { Prisma } from "@prisma/client";
import type { NextRequest } from "next/server";
import { handleRouteError, json, jsonError } from "@/lib/http";
import {
  listResponse,
  parseArticleType,
  parseBottleneckTag,
  parseOptionalBoolean,
  parseOptionalTag,
  parsePagination,
} from "@/lib/pagination";
import { prisma } from "@/lib/prisma";
import { articleListSelect } from "@/lib/selects";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const { page, limit, skip, take } = parsePagination(searchParams);
    const tag = parseOptionalTag(searchParams.get("tag"));
    const featured = parseOptionalBoolean(searchParams.get("featured"));
    const type = parseArticleType(searchParams.get("type"));
    const bottleneckTag = parseBottleneckTag(searchParams.get("bottleneckTag"));

    if (searchParams.get("featured") && featured === undefined) {
      return jsonError("featured must be true or false", 400);
    }
    if (type === "invalid") {
      return jsonError(
        "type must be BREAKDOWN, EXPLAINER, or BUILD_LOG",
        400,
      );
    }
    if (bottleneckTag === "invalid") {
      return jsonError(
        "bottleneckTag must be PRODUCT, SHIPPING, DISTRIBUTION, FUNDING, CLARITY, or OTHER",
        400,
      );
    }

    const where: Prisma.ArticleWhereInput = { published: true };
    if (tag) where.tags = { has: tag };
    if (featured !== undefined) where.featured = featured;
    if (type) where.articleType = type;
    if (bottleneckTag) where.bottleneckTag = bottleneckTag;

    const [items, total] = await Promise.all([
      prisma.article.findMany({
        where,
        select: articleListSelect,
        take,
        skip,
        orderBy: { publishedAt: "desc" },
      }),
      prisma.article.count({ where }),
    ]);

    return json(listResponse(items, page, limit, total));
  } catch (error) {
    return handleRouteError(error);
  }
}
