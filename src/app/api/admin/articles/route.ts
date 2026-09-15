import type { Prisma } from "@prisma/client";
import type { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { parseArticleCreateInput } from "@/lib/content-input";
import { handleRouteError, json, jsonError, readJsonBody } from "@/lib/http";
import {
  listResponse,
  parseArticleType,
  parseBottleneckTag,
  parseOptionalBoolean,
  parseOptionalPublished,
  parseOptionalTag,
  ADMIN_MAX_LIMIT,
  parsePagination,
} from "@/lib/pagination";
import { prisma } from "@/lib/prisma";
import { uniqueSlug } from "@/lib/slug";
import { articleDetailSelect, articleListSelect } from "@/lib/selects";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const searchParams = request.nextUrl.searchParams;
    const { page, limit, skip, take } = parsePagination(
      searchParams,
      ADMIN_MAX_LIMIT,
    );
    const tag = parseOptionalTag(searchParams.get("tag"));
    const featured = parseOptionalBoolean(searchParams.get("featured"));
    const published = parseOptionalPublished(searchParams.get("published"));
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

    const where: Prisma.ArticleWhereInput = {};
    if (tag) where.tags = { has: tag };
    if (featured !== undefined) where.featured = featured;
    if (published !== undefined) where.published = published;
    if (type) where.articleType = type;
    if (bottleneckTag) where.bottleneckTag = bottleneckTag;

    const [items, total] = await Promise.all([
      prisma.article.findMany({
        where,
        select: articleListSelect,
        take,
        skip,
        orderBy: { updatedAt: "desc" },
      }),
      prisma.article.count({ where }),
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
    const data = parseArticleCreateInput(body);
    data.slug = await uniqueSlug("article", data.slug);

    const item = await prisma.article.create({
      data,
      select: articleDetailSelect,
    });

    return json(item, 201);
  } catch (error) {
    return handleRouteError(error);
  }
}
